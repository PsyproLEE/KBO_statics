import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CHAMPIONS, titleRanking } from '../lib/champions.js'
import { loadPostseason, fmt } from '../lib/data.jsx'
import { teamInfo, TEAMS } from '../lib/teams.js'
import TeamLogo from '../components/TeamLogo.jsx'

const HIT_COLS = [
  { key: 'AVG', label: '타율' },
  { key: 'AB', label: '타수' },
  { key: 'H', label: '안타' },
  { key: 'RBI', label: '타점' },
  { key: 'R', label: '득점' },
]
const PIT_COLS = [
  { key: 'ERA', label: '평균자책' },
  { key: 'IP', label: '이닝' },
  { key: 'SO', label: '탈삼진' },
  { key: 'W', label: '승' },
  { key: 'L', label: '패' },
  { key: 'SV', label: '세이브' },
]

function PlayerName({ p }) {
  const inner = (
    <>
      {p.team && <TeamLogo team={p.team} size={16} />}
      <span className="name">{p.name}</span>
    </>
  )
  return p.playerId ? (
    <Link to={`/player/${p.playerId}`} className="ps-name">
      {inner}
    </Link>
  ) : (
    <span className="ps-name">{inner}</span>
  )
}

function PostseasonStats() {
  const [data, setData] = useState(null)
  const [year, setYear] = useState(null)

  useEffect(() => {
    loadPostseason().then((d) => {
      setData(d)
      const yrs = Object.keys(d).sort((a, b) => b - a)
      if (yrs.length) setYear(yrs[0])
    })
  }, [])

  if (!data) return null
  const years = Object.keys(data).sort((a, b) => b - a)
  if (!years.length) return null
  const s = data[year] || data[years[0]]

  return (
    <>
      <h2 className="section-title">한국시리즈 개인 기록</h2>
      <div className="toolbar">
        <select value={year || ''} onChange={(e) => setYear(e.target.value)}>
          {years.map((y) => (
            <option key={y} value={y}>
              {y} 한국시리즈
            </option>
          ))}
        </select>
        <span className="note">
          {s.games}경기 박스스코어 집계 · 안타(타자)·탈삼진(투수) 순
        </span>
      </div>

      <h3 className="ps-subtitle">🏏 타자</h3>
      <div className="card table-wrap">
        <table className="stat">
          <thead>
            <tr>
              <th className="plain left">선수</th>
              {HIT_COLS.map((c) => (
                <th key={c.key} className="plain">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {s.hitters.slice(0, 12).map((p) => (
              <tr key={p.name + (p.playerId || '')}>
                <td className="left">
                  <PlayerName p={p} />
                </td>
                {HIT_COLS.map((c) => (
                  <td key={c.key}>{fmt(p[c.key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="ps-subtitle">🥎 투수</h3>
      <div className="card table-wrap">
        <table className="stat">
          <thead>
            <tr>
              <th className="plain left">선수</th>
              {PIT_COLS.map((c) => (
                <th key={c.key} className="plain">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {s.pitchers.slice(0, 12).map((p) => (
              <tr key={p.name + (p.playerId || '')}>
                <td className="left">
                  <PlayerName p={p} />
                </td>
                {PIT_COLS.map((c) => (
                  <td key={c.key}>{fmt(p[c.key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="updated" style={{ marginTop: 12 }}>
        KBO가 포스트시즌 개인 기록을 별도 제공하지 않아, 한국시리즈 각 경기
        박스스코어를 합산한 값입니다. 타자 기록은 타수·안타·타점·득점만 제공됩니다.
      </p>
    </>
  )
}

export default function History() {
  const ranking = titleRanking()

  return (
    <>
      <div className="page-head">
        <h1>역대 한국시리즈 우승</h1>
        <p>1982년 원년부터 2025년까지 KBO 한국시리즈 우승·준우승 기록.</p>
      </div>

      <h2 className="section-title">🏆 팀별 우승 횟수</h2>
      <div className="title-ranking">
        {ranking.map((r) => {
          const info = teamInfo(r.team)
          const active = !!TEAMS[r.team] // 현존 구단만 페이지 링크
          const inner = (
            <>
              <TeamLogo team={r.team} size={34} />
              <div className="tr-info">
                <div className="tr-name">{info.full}</div>
                <div className="tr-years">{r.years.join(', ')}</div>
              </div>
              <div className="tr-count">
                {r.count}
                <span>회</span>
              </div>
            </>
          )
          return active ? (
            <Link key={r.team} to={`/team/${r.team}`} className="title-card">
              {inner}
            </Link>
          ) : (
            <div key={r.team} className="title-card">
              {inner}
            </div>
          )
        })}
      </div>

      <h2 className="section-title">연도별 우승</h2>
      <div className="card table-wrap">
        <table className="stat champ-table">
          <thead>
            <tr>
              <th className="plain">연도</th>
              <th className="plain left">우승</th>
              <th className="plain left">준우승</th>
              <th className="plain left">시리즈 결과</th>
            </tr>
          </thead>
          <tbody>
            {CHAMPIONS.map((c) => (
              <tr key={c.year}>
                <td className="rank-cell">{c.year}</td>
                <td className="left">
                  <span className="champ-cell">
                    <span className="trophy">🏆</span>
                    <TeamLogo team={c.champ} size={22} />
                    <b>{teamInfo(c.champ).full}</b>
                  </span>
                </td>
                <td className="left">
                  {c.runnerUp ? (
                    <span className="ru-cell">
                      <TeamLogo team={c.runnerUp} size={20} />
                      {teamInfo(c.runnerUp).full}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--ink-3)' }}>—</span>
                  )}
                </td>
                <td className="left" style={{ fontFamily: 'var(--mono)', fontSize: 12.5 }}>
                  {c.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="updated" style={{ marginTop: 12 }}>
        1985년은 삼성이 전·후기 통합 우승하여 한국시리즈가 열리지 않았습니다.
      </p>

      <PostseasonStats />
    </>
  )
}
