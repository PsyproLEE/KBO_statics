import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData, num, teamGamesMap, fmt } from '../lib/data.jsx'
import { teamInfo } from '../lib/teams.js'
import PlayerPhoto from './PlayerPhoto.jsx'
import TeamLogo from './TeamLogo.jsx'

/**
 * 타자/투수 공용 리더보드.
 * categories: [{key, label, asc, rate}] — rate=true면 규정 충족 선수만 순위에 포함
 * columns: 표에 보여줄 [{key, label}]
 * standings: 규정타석·규정이닝 계산에 쓸 (해당 시즌의) 팀 순위표
 * season: 표시 중인 시즌 (선수 페이지로 전달)
 */
export default function Leaderboard({ rows, categories, columns, isQualified, standings, season }) {
  const { players } = useData()
  const games = useMemo(() => teamGamesMap(standings), [standings])
  const teamNames = useMemo(
    () => [...new Set(rows.map((r) => r['팀명']))].sort(),
    [rows],
  )
  const [cat, setCat] = useState(categories[0])
  const [team, setTeam] = useState('')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState(null) // 표 헤더 클릭 정렬 (없으면 카테고리 순)
  const [includeAll, setIncludeAll] = useState(false) // 규정 미달 선수도 표에 포함

  const active = sort || { key: cat.key, asc: cat.asc, rate: cat.rate }
  const applyRate = active.rate && !includeAll

  // 상위 5명 리더 카드는 항상 규정 충족 선수 기준 (정확한 리더)
  const top5 = useMemo(() => {
    let list = rows.filter((r) => num(r[active.key]) != null)
    if (active.rate) list = list.filter((r) => isQualified(r, games[r['팀명']] || 0))
    list.sort((a, b) => {
      const d = (num(a[active.key]) ?? 0) - (num(b[active.key]) ?? 0)
      return active.asc ? d : -d
    })
    return list.slice(0, 5)
  }, [rows, active.key, active.asc, active.rate, games, isQualified])

  // 표에 뿌릴 전체 순위 (규정 미달 포함 옵션 반영)
  const ranked = useMemo(() => {
    let list = rows.filter((r) => num(r[active.key]) != null)
    if (applyRate) list = list.filter((r) => isQualified(r, games[r['팀명']] || 0))
    list.sort((a, b) => {
      const d = (num(a[active.key]) ?? 0) - (num(b[active.key]) ?? 0)
      return active.asc ? d : -d
    })
    return list
  }, [rows, active.key, active.asc, applyRate, games, isQualified])

  // 진짜 순위 = 지표의 정방향(1=최고) 기준. 표시 정렬을 뒤집어도 순위는 그대로.
  // (타율 오름차순으로 봐도 최하위 선수가 1위로 표시되지 않도록)
  const canonicalAsc = categories.find((c) => c.key === active.key)?.asc ?? false
  const rankMap = useMemo(() => {
    const pool = [...ranked].sort((a, b) => {
      const d = (num(a[active.key]) ?? 0) - (num(b[active.key]) ?? 0)
      return canonicalAsc ? d : -d
    })
    const map = new Map()
    let prevVal = null
    let prevRank = 0
    pool.forEach((r, i) => {
      const v = num(r[active.key])
      const rank = v === prevVal ? prevRank : i + 1 // 동률은 같은 순위
      map.set(r.playerId, rank)
      prevVal = v
      prevRank = rank
    })
    return map
  }, [ranked, active.key, canonicalAsc])

  const visible = useMemo(() => {
    let list = ranked
    if (team) list = list.filter((r) => r['팀명'] === team)
    if (query.trim()) list = list.filter((r) => r['선수명'].includes(query.trim()))
    return list
  }, [ranked, team, query])

  const pickCat = (c) => {
    setCat(c)
    setSort(null)
  }

  const clickHeader = (key) => {
    if (key === '선수명' || key === '팀명') return
    setSort((prev) => {
      const base = categories.find((c) => c.key === key)
      if (prev?.key === key) return { ...prev, asc: !prev.asc }
      return { key, asc: base?.asc ?? false, rate: base?.rate ?? false }
    })
  }

  return (
    <>
      <div className="chips" role="tablist">
        {categories.map((c) => (
          <button
            key={c.key}
            className={`chip ${!sort && cat.key === c.key ? 'on' : ''}`}
            onClick={() => pickCat(c)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {!sort && (
        <div className="leaders">
          {top5.map((r, i) => {
            const p = players[r.playerId] || {}
            return (
              <Link
                to={`/player/${r.playerId}`}
                state={{ row: r, year: season }}
                className={`leader-card ${i === 0 ? 'first' : ''}`}
                key={r.playerId}
              >
                <PlayerPhoto src={p.photo} pid={r.playerId} name={r['선수명']} year={season} className="photo" />
                <div className="info">
                  <div className="team" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <TeamLogo team={r['팀명']} size={16} />
                    <span className="tname">{r['팀명']}</span>
                  </div>
                  <div className="name">{r['선수명']}</div>
                  <div className="value">{fmt(r[cat.key])}</div>
                  <div className="value-label">{cat.label}</div>
                </div>
                <span className="rank-badge">{i + 1}위</span>
              </Link>
            )
          })}
        </div>
      )}

      <div className="toolbar">
        <input
          placeholder="선수 이름 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          <option value="">전체 팀</option>
          {teamNames.map((t) => (
            <option key={t} value={t}>
              {teamInfo(t).full}
            </option>
          ))}
        </select>
        {active.rate && (
          <label className="toggle">
            <input
              type="checkbox"
              checked={includeAll}
              onChange={(e) => setIncludeAll(e.target.checked)}
            />
            규정 미달 포함
          </label>
        )}
        <span className="note">
          총 {visible.length}명
          {applyRate ? ' · 규정 충족만' : ''} · 열 제목을 누르면 정렬
        </span>
      </div>

      <div className="card table-wrap">
        <table className="stat">
          <thead>
            <tr>
              <th className="plain">#</th>
              <th className="plain left">선수</th>
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={active.key === c.key ? 'sorted' : ''}
                  onClick={() => clickHeader(c.key)}
                  title={`${c.label} 기준 정렬`}
                >
                  {c.label}
                  {active.key === c.key ? (active.asc ? ' ▲' : ' ▼') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const p = players[r.playerId] || {}
              const rank = rankMap.get(r.playerId)
              return (
                <tr key={r.playerId}>
                  <td className={`rank-cell ${rank === 1 ? 'rank-1' : ''}`}>{rank}</td>
                  <td className="left">
                    <Link
                      to={`/player/${r.playerId}`}
                      state={{ row: r, year: season }}
                      className="player-cell"
                    >
                      <PlayerPhoto src={p.photo} pid={r.playerId} name={r['선수명']} year={season} />
                      <span>
                        <span className="name">{r['선수명']}</span>{' '}
                        <span className="team">{r['팀명']}</span>
                      </span>
                    </Link>
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className={active.key === c.key ? 'hl' : ''}>
                      {fmt(r[c.key])}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
