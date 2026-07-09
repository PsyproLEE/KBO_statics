import { createContext, useContext, useEffect, useState } from 'react'

const DataContext = createContext(null)

const FILES = ['standings', 'hitters', 'pitchers', 'players', 'meta']

export function DataProvider({ children }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all(
      FILES.map((f) =>
        fetch(`${import.meta.env.BASE_URL}data/${f}.json`).then((r) => {
          if (!r.ok) throw new Error(`${f}.json 로드 실패 (${r.status})`)
          return r.json()
        }),
      ),
    )
      .then(([standings, hitters, pitchers, players, meta]) =>
        setData({ standings, hitters, pitchers, players, meta }),
      )
      .catch((e) => setError(e.message))
  }, [])

  if (error)
    return (
      <div className="load-state">
        데이터를 불러오지 못했습니다: {error}
        <br />
        <code>py scraper/scrape_kbo.py</code> 를 먼저 실행해 주세요.
      </div>
    )
  if (!data) return <div className="load-state">데이터 불러오는 중…</div>
  return <DataContext.Provider value={data}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}

/** '0.364' / '92 2/3' / '1,234' / '-' 등을 숫자로. 실패 시 null */
export function num(v) {
  if (v == null) return null
  const s = String(v).replace(/,/g, '').trim()
  if (s === '' || s === '-') return null
  const frac = s.match(/^(\d+)\s+(\d)\/3$/) // 이닝 표기 '92 2/3'
  if (frac) return Number(frac[1]) + Number(frac[2]) / 3
  const only = s.match(/^(\d)\/3$/)
  if (only) return Number(only[1]) / 3
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/** 팀별 경기 수 (규정타석·규정이닝 계산용) */
export function teamGamesMap(standings) {
  const map = {}
  for (const t of standings) map[t['팀명']] = num(t['경기']) || 0
  return map
}

export function isQualifiedHitter(row, games) {
  const pa = num(row['PA'])
  return pa != null && pa >= games * 3.1
}

export function isQualifiedPitcher(row, games) {
  const ip = num(row['IP'])
  return ip != null && ip >= games * 1.0
}

/** 소수 스탯을 '.364' 대신 '0.364' 로 통일 표시 */
export function fmt(v) {
  return v == null || v === '' ? '-' : v
}

/** 연도별 기록(용량이 커서 선수 페이지에서만 지연 로드, 1회 캐시) */
let careersPromise = null
export function loadCareers() {
  careersPromise ??= fetch(`${import.meta.env.BASE_URL}data/careers.json`).then((r) => {
    if (!r.ok) throw new Error(`careers.json 로드 실패 (${r.status})`)
    return r.json()
  })
  return careersPromise
}

/** 과거 시즌 데이터 (연도 선택 시 지연 로드, 연도별 캐시) */
const seasonCache = {}
export function loadSeason(year) {
  seasonCache[year] ??= fetch(`${import.meta.env.BASE_URL}data/season/${year}.json`).then(
    (r) => {
      if (!r.ok) throw new Error(`${year} 시즌 데이터 없음 (${r.status})`)
      return r.json()
    },
  )
  return seasonCache[year]
}

/** 수집된 과거 시즌 연도 목록 */
let seasonsPromise = null
export function loadSeasonsList() {
  seasonsPromise ??= fetch(`${import.meta.env.BASE_URL}data/seasons.json`).then((r) =>
    r.ok ? r.json() : [],
  )
  return seasonsPromise
}
