import { Link } from 'react-router-dom'
import { CHAMPIONS, titleRanking } from '../lib/champions.js'
import { teamInfo, TEAMS } from '../lib/teams.js'
import TeamLogo from '../components/TeamLogo.jsx'

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
    </>
  )
}
