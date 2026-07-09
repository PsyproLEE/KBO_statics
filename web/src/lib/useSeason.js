import { useEffect, useState } from 'react'
import { useData, loadSeason, loadSeasonsList } from './data.jsx'

/**
 * 시즌 선택 상태 + 해당 시즌의 데이터.
 * 현재 시즌이면 이미 로드된 컨텍스트 데이터를, 과거 시즌이면 season/{연도}.json을 사용.
 */
export function useSeason(initialYear) {
  const ctx = useData()
  const current = ctx.meta.season
  const [year, setYear] = useState(initialYear || current)
  const [years, setYears] = useState([current])
  const [past, setPast] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSeasonsList()
      .then((ys) =>
        setYears([...new Set([current, ...ys])].sort((a, b) => b - a)),
      )
      .catch(() => {})
  }, [current])

  useEffect(() => {
    if (year === current) {
      setPast(null)
      return
    }
    let alive = true
    setLoading(true)
    loadSeason(year)
      .then((d) => {
        if (!alive) return
        setPast(d)
        setLoading(false)
      })
      .catch(() => {
        if (!alive) return
        setYear(current)
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [year, current])

  const showPast = year !== current && past?.season === year
  return {
    year,
    setYear,
    years,
    isCurrent: year === current,
    loading: loading || (year !== current && !showPast),
    standings: showPast ? past.standings : ctx.standings,
    hitters: showPast ? past.hitters : ctx.hitters,
    pitchers: showPast ? past.pitchers : ctx.pitchers,
  }
}
