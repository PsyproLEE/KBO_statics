# -*- coding: utf-8 -*-
"""KBO 역대 시즌(1982~직전 시즌) 팀 순위 + 타자/투수 기록 수집.

사용법:  py scraper/scrape_history.py
결과:    web/public/data/season/{연도}.json
이미 수집된 연도는 건너뛰므로 중단 후 재실행해도 이어서 진행된다.
"""
import sys
import json
import re
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).resolve().parent))
from scrape_kbo import (BASE, HEADERS, OUT_DIR, get_soup, hidden_fields,
                        parse_stat_table, page_count, merge_by_player,
                        PAGER_PREFIX, TEAM_SELECT)

SEASON_SELECT = 'ctl00$ctl00$ctl00$cphContents$cphContents$cphContents$ddlSeason$ddlSeason'
YEAR_SELECT = 'ctl00$ctl00$ctl00$cphContents$cphContents$cphContents$ddlYear'
SEASON_DIR = OUT_DIR / 'season'
FIRST_SEASON = 1982
LAST_SEASON = 2025  # 현재 시즌(2026)은 scrape_kbo.py가 담당


def postback(session, url, soup, target, extra=None):
    data = hidden_fields(soup)
    data['__EVENTTARGET'] = target
    data['__EVENTARGUMENT'] = ''
    if extra:
        data.update(extra)
    r = session.post(url, data=data, timeout=25)
    r.raise_for_status()
    return BeautifulSoup(r.text, 'html.parser'), r.text


def season_team_codes(session, url, season):
    soup, _ = get_soup(session, url)
    soup, _ = postback(session, url, soup, SEASON_SELECT, {SEASON_SELECT: str(season)})
    team_sel = soup.find('select', id=re.compile('ddlTeam'))
    return [o.get('value') for o in team_sel.find_all('option') if o.get('value')]


def season_players(session, url, season, codes):
    """팀마다 새로 GET → 시즌 변경 → 팀 선택 순서로 요청해 상태 꼬임을 방지.

    (포스트백 상태를 팀 간에 재사용하면 표가 갱신되지 않는 경우가 있어
    요청 수가 늘더라도 매번 새로 시작한다.)
    """
    rows = []
    extra = {SEASON_SELECT: str(season)}
    for code in codes:
        soup, _ = get_soup(session, url)
        soup, _ = postback(session, url, soup, SEASON_SELECT, extra)
        soup, html = postback(session, url, soup, TEAM_SELECT,
                              {**extra, TEAM_SELECT: code})
        team_rows = parse_stat_table(soup)
        for page in range(2, page_count(html) + 1):
            soup, html = postback(session, url, soup, f'{PAGER_PREFIX}{page}',
                                  {**extra, TEAM_SELECT: code})
            team_rows.extend(parse_stat_table(soup))
            time.sleep(0.1)
        # 팀 필터 결과 검증: 다른 팀 행이 섞였으면 상태가 꼬인 것
        team_rows = [r for r in team_rows if r.get('playerId')]
        rows.extend(team_rows)
        time.sleep(0.1)
    return rows


def season_standings(session, season):
    """연도별 팀 순위. 1999~2000 양대리그 시즌은 표가 2개라 모두 합친다."""
    url = f'{BASE}/Record/TeamRank/TeamRank.aspx'
    soup, _ = get_soup(session, url)
    soup, _ = postback(session, url, soup, YEAR_SELECT, {YEAR_SELECT: str(season)})
    teams = []
    for table in soup.find_all('table'):
        headers = [th.get_text(strip=True) for th in table.find_all('th')]
        if '승률' not in headers:
            continue
        for tr in table.find_all('tr')[1:]:
            tds = [td.get_text(strip=True) for td in tr.find_all('td')]
            if len(tds) == len(headers):
                teams.append(dict(zip(headers, tds)))
    return teams


def main():
    SEASON_DIR.mkdir(parents=True, exist_ok=True)
    s = requests.Session()
    s.headers.update(HEADERS)

    for year in range(LAST_SEASON, FIRST_SEASON - 1, -1):
        out = SEASON_DIR / f'{year}.json'
        if out.exists():
            print(f'{year}: 이미 있음, 건너뜀')
            continue
        try:
            standings = season_standings(s, year)
            hit_url = f'{BASE}/Record/Player/HitterBasic/Basic1.aspx'
            codes = season_team_codes(s, hit_url, year)
            h1 = season_players(s, hit_url, year, codes)
            h2 = season_players(s, f'{BASE}/Record/Player/HitterBasic/Basic2.aspx', year, codes)
            p1 = season_players(s, f'{BASE}/Record/Player/PitcherBasic/Basic1.aspx', year, codes)
            p2 = season_players(s, f'{BASE}/Record/Player/PitcherBasic/Basic2.aspx', year, codes)
            data = {
                'season': year,
                'standings': standings,
                'hitters': merge_by_player(h1, h2),
                'pitchers': merge_by_player(p1, p2),
            }
            # 간단 무결성 검사: 팀 수 대비 선수가 너무 적으면 저장하지 않음
            # (1982 원년은 팀당 투수가 7명 수준이라 기준을 낮게 잡는다)
            if len(data['hitters']) < len(standings) * 10 or \
               len(data['pitchers']) < len(standings) * 6:
                print(f'{year}: 데이터 불충분 (타자 {len(data["hitters"])}, '
                      f'투수 {len(data["pitchers"])}) - 저장 안 함', flush=True)
                continue
            out.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
            write_index()
            print(f'{year}: 팀 {len(standings)} / 타자 {len(data["hitters"])} / '
                  f'투수 {len(data["pitchers"])} 저장', flush=True)
        except Exception as e:
            print(f'{year}: 실패 - {e}', flush=True)
        time.sleep(0.3)

    write_index()


def write_index():
    years = sorted(int(p.stem) for p in SEASON_DIR.glob('*.json') if p.stem.isdigit())
    (OUT_DIR / 'seasons.json').write_text(json.dumps(years), encoding='utf-8')


if __name__ == '__main__':
    main()
