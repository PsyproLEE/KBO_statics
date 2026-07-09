# -*- coding: utf-8 -*-
"""KBO 공식 홈페이지(koreabaseball.com)에서 팀 순위/타자/투수 기록과
선수 프로필을 수집해 web/public/data/*.json 으로 저장한다.

사용법:  py scraper/scrape_kbo.py
재실행하면 최신 데이터로 갱신된다.
"""
import sys
import json
import re
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests
from bs4 import BeautifulSoup

sys.stdout.reconfigure(encoding='utf-8')

BASE = 'https://www.koreabaseball.com'
HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
OUT_DIR = Path(__file__).resolve().parent.parent / 'web' / 'public' / 'data'
KST = timezone(timedelta(hours=9))

PAGER_PREFIX = 'ctl00$ctl00$ctl00$cphContents$cphContents$cphContents$ucPager$btnNo'
TEAM_SELECT = 'ctl00$ctl00$ctl00$cphContents$cphContents$cphContents$ddlTeam$ddlTeam'
TEAM_CODES = ['SS', 'LG', 'KT', 'HT', 'OB', 'HH', 'NC', 'LT', 'SK', 'WO']


def get_soup(session, url, **kwargs):
    r = session.get(url, timeout=20, **kwargs)
    r.raise_for_status()
    return BeautifulSoup(r.text, 'html.parser'), r.text


def parse_stat_table(soup):
    """기록 테이블 하나를 [{col: val, playerId, detailUrl}] 리스트로 파싱."""
    table = soup.find('table')
    if table is None:
        return []
    headers = [th.get_text(strip=True) for th in table.find_all('th')]
    rows = []
    for tr in table.find_all('tr')[1:]:
        tds = tr.find_all('td')
        if len(tds) != len(headers):
            continue
        row = {}
        for h, td in zip(headers, tds):
            row[h] = td.get_text(strip=True)
        a = tr.find('a')
        if a and 'playerId=' in (a.get('href') or ''):
            row['playerId'] = a['href'].split('playerId=')[1].split('&')[0]
            row['detailUrl'] = BASE + a['href']
        rows.append(row)
    return rows


def hidden_fields(soup):
    fields = {}
    for inp in soup.find_all('input', {'type': 'hidden'}):
        name = inp.get('name')
        if name:
            fields[name] = inp.get('value', '')
    # 드롭다운 현재 선택값도 포함해야 포스트백이 유효하다
    for sel in soup.find_all('select'):
        name = sel.get('name')
        if not name:
            continue
        opt = sel.find('option', selected=True) or sel.find('option')
        if opt is not None:
            fields[name] = opt.get('value', '')
    return fields


def page_count(html):
    nums = re.findall(re.escape(PAGER_PREFIX) + r'(\d+)', html)
    return max((int(n) for n in nums), default=1)


def postback(session, url, soup, target, extra=None):
    data = hidden_fields(soup)
    data['__EVENTTARGET'] = target
    data['__EVENTARGUMENT'] = ''
    if extra:
        data.update(extra)
    r = session.post(url, data=data, timeout=20)
    r.raise_for_status()
    return BeautifulSoup(r.text, 'html.parser'), r.text


def scrape_all_teams(session, url):
    """팀 필터를 순회하며 (규정 미달 선수 포함) 전 선수의 행을 수집."""
    all_rows = []
    for code in TEAM_CODES:
        soup, _ = get_soup(session, url)
        soup, html = postback(session, url, soup, TEAM_SELECT, {TEAM_SELECT: code})
        all_rows.extend(parse_stat_table(soup))
        total = page_count(html)
        for page in range(2, total + 1):
            soup, html = postback(session, url, soup, f'{PAGER_PREFIX}{page}',
                                  {TEAM_SELECT: code})
            all_rows.extend(parse_stat_table(soup))
            time.sleep(0.2)
        time.sleep(0.2)
    return all_rows


def merge_by_player(basic1, basic2):
    """Basic1/Basic2 두 표를 playerId 기준으로 병합."""
    merged = {}
    for row in basic1:
        pid = row.get('playerId')
        if pid:
            merged[pid] = dict(row)
    for row in basic2:
        pid = row.get('playerId')
        if pid and pid in merged:
            for k, v in row.items():
                merged[pid].setdefault(k, v)
        elif pid:
            merged[pid] = dict(row)
    return list(merged.values())


def scrape_standings(session):
    soup, _ = get_soup(session, f'{BASE}/Record/TeamRank/TeamRankDaily.aspx')
    table = soup.find('table')
    headers = [th.get_text(strip=True) for th in table.find_all('th')]
    teams = []
    for tr in table.find_all('tr')[1:]:
        tds = [td.get_text(strip=True) for td in tr.find_all('td')]
        if len(tds) == len(headers):
            teams.append(dict(zip(headers, tds)))
    return teams


def scrape_player_detail(session, url):
    """선수 상세 페이지에서 사진 URL과 프로필을 추출."""
    try:
        soup, _ = get_soup(session, url)
    except requests.RequestException:
        return {}
    info = {}
    # 선수 사진은 반드시 /person/ 경로의 이미지 (엠블럼 등 다른 img와 구분)
    for im in soup.find_all('img'):
        src = im.get('src') or ''
        if '/person/' in src:
            if src.startswith('//'):
                src = 'https:' + src
            info['photo'] = src
            break
    basic = soup.select_one('.player_basic') or soup.select_one('.player_info')
    if basic is not None:
        label_map = {'선수명': 'name', '등번호': 'backNo', '생년월일': 'birth',
                     '포지션': 'position', '신장/체중': 'body', '경력': 'career',
                     '입단년도': 'debut'}
        segs = [t.strip() for t in basic.get_text('|', strip=True).split('|')]
        i = 0
        while i < len(segs):
            seg = segs[i]
            if seg.endswith(':') and seg[:-1] in label_map:
                vals = []
                j = i + 1
                while j < len(segs) and not segs[j].endswith(':'):
                    vals.append(segs[j])
                    j += 1
                info[label_map[seg[:-1]]] = ' '.join(vals).strip()
                i = j
            else:
                i += 1
        if 'backNo' in info:
            info['backNo'] = info['backNo'].replace('No.', '').strip()
    return info


def scrape_career(session, pid, kind):
    """연도별(통산) 기록. kind: 'hitter' | 'pitcher'"""
    page = 'HitterDetail' if kind == 'hitter' else 'PitcherDetail'
    url = f'{BASE}/Record/Player/{page}/Total.aspx?playerId={pid}'
    try:
        soup, _ = get_soup(session, url)
    except requests.RequestException:
        return None
    table = soup.find('table')
    if table is None:
        return None
    ths = [th.get_text(strip=True) for th in table.find_all('th')]
    if '통산' in ths:
        cols = ths[:ths.index('통산')]
        total_vals = ths[ths.index('통산') + 1:]
    else:
        cols, total_vals = ths, []
    rows = []
    for tr in table.find_all('tr'):
        tds = [td.get_text(strip=True) for td in tr.find_all('td')]
        if len(tds) == len(cols) and re.match(r'^\d{4}$', tds[0]):
            rows.append(dict(zip(cols, tds)))
    if not rows:
        return None
    result = {'columns': cols, 'rows': rows}
    # 통산 행: '통산' th가 연도+팀명 자리를 차지하므로 나머지 값은 cols[2:]와 대응
    if total_vals and len(total_vals) == len(cols) - 2:
        result['total'] = dict(zip(cols[2:], total_vals))
    return result


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    s = requests.Session()
    s.headers.update(HEADERS)

    print('[1/5] 팀 순위 수집...')
    standings = scrape_standings(s)
    print(f'  -> {len(standings)}개 팀')

    print('[2/5] 타자 기록 수집 (팀별 전체)...')
    h1 = scrape_all_teams(s, f'{BASE}/Record/Player/HitterBasic/Basic1.aspx')
    h2 = scrape_all_teams(s, f'{BASE}/Record/Player/HitterBasic/Basic2.aspx')
    hitters = merge_by_player(h1, h2)
    print(f'  -> {len(hitters)}명')

    print('[3/5] 투수 기록 수집 (팀별 전체)...')
    p1 = scrape_all_teams(s, f'{BASE}/Record/Player/PitcherBasic/Basic1.aspx')
    p2 = scrape_all_teams(s, f'{BASE}/Record/Player/PitcherBasic/Basic2.aspx')
    pitchers = merge_by_player(p1, p2)
    print(f'  -> {len(pitchers)}명')

    print('[4/5] 선수 프로필/사진 수집...')
    players = {}
    targets = [(r['playerId'], r['detailUrl'], 'hitter') for r in hitters if 'detailUrl' in r]
    targets += [(r['playerId'], r['detailUrl'], 'pitcher') for r in pitchers if 'detailUrl' in r]
    for i, (pid, url, role) in enumerate(targets):
        if pid in players:
            players[pid]['roles'] = sorted(set(players[pid].get('roles', []) + [role]))
            continue
        detail = scrape_player_detail(s, url)
        detail['playerId'] = pid
        detail['roles'] = [role]
        players[pid] = detail
        time.sleep(0.15)
        if (i + 1) % 50 == 0:
            print(f'  ... {i + 1}/{len(targets)}')
    print(f'  -> {len(players)}명 프로필 완료')

    print('[5/5] 연도별(통산) 기록 수집...')
    careers = {}
    career_targets = [(pid, role) for pid, p in players.items() for role in p['roles']]
    for i, (pid, role) in enumerate(career_targets):
        career = scrape_career(s, pid, role)
        if career:
            careers.setdefault(pid, {})[role] = career
        time.sleep(0.15)
        if (i + 1) % 50 == 0:
            print(f'  ... {i + 1}/{len(career_targets)}')
    print(f'  -> {len(careers)}명 연도별 기록 완료')

    meta = {'updatedAt': datetime.now(KST).strftime('%Y-%m-%d %H:%M'),
            'season': 2026,
            'source': 'KBO 공식 홈페이지 (koreabaseball.com)'}

    for name, data in [('standings', standings), ('hitters', hitters),
                       ('pitchers', pitchers), ('players', players),
                       ('careers', careers), ('meta', meta)]:
        path = OUT_DIR / f'{name}.json'
        path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
        print(f'저장: {path}')


if __name__ == '__main__':
    main()
