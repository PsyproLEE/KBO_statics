# -*- coding: utf-8 -*-
"""최근 KBO 한국시리즈(들)의 선수별 기록을 경기 박스스코어에서 합산해
web/public/data/postseason.json 으로 저장한다.

KBO는 포스트시즌 개인 기록을 리더보드로 제공하지 않아, 각 경기 박스스코어
(ws/Schedule.asmx/GetBoxScoreScroll)를 모아 직접 집계한다.

사용법:  py scraper/scrape_postseason.py
"""
import sys
import json
import re
import time
from pathlib import Path

import requests

sys.stdout.reconfigure(encoding='utf-8')

BASE = 'https://www.koreabaseball.com'
HEADERS = {
    'User-Agent': 'Mozilla/5.0',
    'Referer': f'{BASE}/Schedule/GameCenter/Main.aspx',
    'X-Requested-With': 'XMLHttpRequest',
}
OUT_DIR = Path(__file__).resolve().parent.parent / 'web' / 'public' / 'data'
KS_SERIES = '7'          # 한국시리즈
FIRST_YEAR = 2021        # 최근 한국시리즈만 (조정 가능)
LAST_YEAR = 2025


def ip_to_float(s):
    s = (s or '').strip()
    m = re.match(r'^(\d+)\s+(\d)/3$', s)
    if m:
        return int(m.group(1)) + int(m.group(2)) / 3
    m = re.match(r'^(\d)/3$', s)
    if m:
        return int(m.group(1)) / 3
    try:
        return float(s)
    except ValueError:
        return 0.0


def to_int(s):
    try:
        return int(str(s).replace(',', '').strip())
    except (ValueError, AttributeError):
        return 0


def ks_game_ids(session, year):
    """해당 연도 한국시리즈 경기 ID 목록 (10·11월 조회 후 dedup)."""
    ids = []
    for month in ('10', '11'):
        r = session.post(
            f'{BASE}/ws/Schedule.asmx/GetScheduleList',
            data={'leId': '1', 'srIdList': KS_SERIES, 'seasonId': str(year),
                  'gameMonth': month, 'teamId': ''},
            timeout=20,
        )
        ids += re.findall(r'(20\d{6}[A-Z]{2,3}[A-Z]{2}\d)', r.text)
        time.sleep(0.2)
    seen = set()
    return [g for g in ids if not (g in seen or seen.add(g))]


def frag_rows(fragment_str):
    """박스스코어 JSON 프래그먼트 → [[cellText,...], ...]"""
    try:
        obj = json.loads(fragment_str)
    except (json.JSONDecodeError, TypeError):
        return []
    out = []
    for r in obj.get('rows', []):
        out.append([c.get('Text', '').strip() for c in r.get('row', [])])
    return out


def parse_boxscore(session, year, game_id):
    r = session.post(
        f'{BASE}/ws/Schedule.asmx/GetBoxScoreScroll',
        data={'leId': '1', 'srId': KS_SERIES, 'seasonId': str(year), 'gameId': game_id},
        timeout=20,
    )
    d = r.json()
    hitters, pitchers = [], []
    # 타자: table1=[순번,위치,선수명], table3=[타수,안타,타점,득점,타율]
    for team in d.get('arrHitter', []):
        names = frag_rows(team.get('table1', ''))
        stats = frag_rows(team.get('table3', ''))
        for nm, st in zip(names, stats):
            if len(nm) < 3 or not nm[2] or nm[2] in ('합계', '선수명'):
                continue
            if len(st) < 4:
                continue
            hitters.append({
                'name': nm[2], 'AB': to_int(st[0]), 'H': to_int(st[1]),
                'RBI': to_int(st[2]), 'R': to_int(st[3]),
            })
    # 투수: 선수명·등판·결과·승·패·세·이닝·타자·투구수·타수·피안타·홈런·4사구·삼진·실점·자책
    for team in d.get('arrPitcher', []):
        for row in frag_rows(team.get('table', '')):
            if len(row) < 16 or not row[0] or row[0] in ('합계', '선수명'):
                continue
            pitchers.append({
                'name': row[0], 'W': to_int(row[3]), 'L': to_int(row[4]),
                'SV': to_int(row[5]), 'IP': ip_to_float(row[6]),
                'H': to_int(row[10]), 'HR': to_int(row[11]), 'BB': to_int(row[12]),
                'SO': to_int(row[13]), 'R': to_int(row[14]), 'ER': to_int(row[15]),
            })
    return hitters, pitchers


def id_map(year):
    """정규시즌 데이터로 이름→(playerId, 팀명) 매핑 (포스트시즌 선수 ID 부여용)."""
    m = {}
    path = OUT_DIR / 'season' / f'{year}.json'
    if not path.exists():
        # 현재 시즌은 개별 파일 사용
        for f in ('hitters', 'pitchers'):
            p = OUT_DIR / f'{f}.json'
            if p.exists():
                for row in json.loads(p.read_text(encoding='utf-8')):
                    m.setdefault(row['선수명'], (row.get('playerId'), row['팀명']))
        return m
    data = json.loads(path.read_text(encoding='utf-8'))
    for row in data.get('hitters', []) + data.get('pitchers', []):
        m.setdefault(row['선수명'], (row.get('playerId'), row['팀명']))
    return m


def aggregate(records, keys):
    """이름별로 counting stat 합산."""
    agg = {}
    for rec in records:
        a = agg.setdefault(rec['name'], {'name': rec['name'], **{k: 0 for k in keys}})
        for k in keys:
            a[k] += rec.get(k, 0)
    return agg


def main():
    s = requests.Session()
    s.headers.update(HEADERS)
    result = {}

    for year in range(LAST_YEAR, FIRST_YEAR - 1, -1):
        games = ks_game_ids(s, year)
        if not games:
            print(f'{year}: 한국시리즈 경기 없음 (건너뜀)')
            continue
        all_hit, all_pit = [], []
        for g in games:
            try:
                h, p = parse_boxscore(s, year, g)
                all_hit += h
                all_pit += p
            except Exception as e:
                print(f'  {g} 실패: {e}')
            time.sleep(0.25)

        names = id_map(year)
        hit = aggregate(all_hit, ['AB', 'H', 'RBI', 'R'])
        pit = aggregate(all_pit, ['W', 'L', 'SV', 'H', 'HR', 'BB', 'SO', 'R', 'ER'])
        # IP는 소수라 별도 합산
        ip_sum = {}
        for rec in all_pit:
            ip_sum[rec['name']] = ip_sum.get(rec['name'], 0) + rec['IP']

        hitters = []
        for a in hit.values():
            pid, team = names.get(a['name'], (None, None))
            a['AVG'] = round(a['H'] / a['AB'], 3) if a['AB'] else 0
            a['playerId'] = pid
            a['team'] = team
            hitters.append(a)
        pitchers = []
        for a in pit.values():
            pid, team = names.get(a['name'], (None, None))
            ip = round(ip_sum.get(a['name'], 0), 2)
            a['IP'] = ip
            a['ERA'] = round(a['ER'] * 9 / ip, 2) if ip else 0
            a['playerId'] = pid
            a['team'] = team
            pitchers.append(a)

        hitters.sort(key=lambda x: (-x['H'], -x['AVG']))
        pitchers.sort(key=lambda x: (-x['SO'], x['ERA']))
        result[str(year)] = {'games': len(games), 'hitters': hitters, 'pitchers': pitchers}
        print(f'{year}: {len(games)}경기 · 타자 {len(hitters)}명 · 투수 {len(pitchers)}명')

    path = OUT_DIR / 'postseason.json'
    path.write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'저장: {path} ({len(result)}개 시즌)')


if __name__ == '__main__':
    main()
