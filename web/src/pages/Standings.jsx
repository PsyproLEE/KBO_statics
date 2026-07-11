import { Link } from 'react-router-dom'
import { useData, num } from '../lib/data.jsx'
import { useSeason } from '../lib/useSeason.js'
import { teamInfo } from '../lib/teams.js'
import { championOf } from '../lib/champions.js'
import TeamLogo from '../components/TeamLogo.jsx'
import SeasonPicker from '../components/SeasonPicker.jsx'

/** '9승0무1패' → [{n, type}] 뱃지용 파싱 */
function parseRecent(s) {
  const m = String(s).match(/(\d+)승(\d+)무(\d+)패/)
  if (!m) return null
  return { w: +m[1], d: +m[2], l: +m[3] }
}

export default function Standings() {
  const { meta } = useData()
  const { year, setYear, years, isCurrent, loading, standings } = useSeason()
  const maxPct = Math.max(...standings.map((t) => num(t['승률']) || 0))

  return (
    <>
      <div className="page-head">
        <h1>{year} KBO 리그 팀 순위</h1>
        <p style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <SeasonPicker year={year} years={years} onChange={setYear} loading={loading} />
          {isCurrent && <span className="updated">업데이트 {meta.updatedAt}</span>}
        </p>
      </div>

      <div className="card table-wrap">
        <table className="stat">
          <thead>
            <tr>
              <th className="plain">순위</th>
              <th className="plain left">팀</th>
              <th className="plain">경기</th>
              <th className="plain">승</th>
              <th className="plain">무</th>
              <th className="plain">패</th>
              <th className="plain">승률</th>
              <th className="plain">게임차</th>
              <th className="plain">최근 10경기</th>
              <th className="plain">연속</th>
              <th className="plain">홈</th>
              <th className="plain">방문</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((t) => {
              const rank = t['순위']
              const rec = isCurrent ? parseRecent(t['최근10경기']) : null
              const streak = t['연속'] || ''
              const pct = num(t['승률']) || 0
              const ks = championOf(year)
              const title =
                ks && ks.champ === t['팀명']
                  ? 'champ'
                  : ks && ks.runnerUp === t['팀명']
                    ? 'ru'
                    : null
              const teamCell = (
                <>
                  <TeamLogo team={t['팀명']} size={26} />
                  {teamInfo(t['팀명']).full}
                  {title === 'champ' && (
                    <span className="ks-badge champ" title={`${year} 한국시리즈 우승`}>
                      🏆 우승
                    </span>
                  )}
                  {title === 'ru' && (
                    <span className="ks-badge ru" title={`${year} 한국시리즈 준우승`}>
                      준우승
                    </span>
                  )}
                </>
              )
              return (
                <tr key={t['팀명']}>
                  <td className={`rank-cell ${rank === '1' ? 'rank-1' : ''}`}>{rank}</td>
                  <td className="left">
                    <Link
                      to={`/team/${t['팀명']}`}
                      state={{ year }}
                      className="team-chip team-link"
                    >
                      {teamCell}
                    </Link>
                  </td>
                  <td>{t['경기']}</td>
                  <td>{t['승']}</td>
                  <td>{t['무']}</td>
                  <td>{t['패']}</td>
                  <td>
                    <span className="wpct-bar">
                      <span className="track">
                        <span
                          className="fill"
                          style={{ width: `${(pct / maxPct) * 100}%` }}
                        />
                      </span>
                      {t['승률']}
                    </span>
                  </td>
                  <td>{t['게임차']}</td>
                  <td>
                    {rec ? (
                      <span className="recent">
                        <span className="pill w">{rec.w}승</span>
                        {rec.d > 0 && <span className="pill d">{rec.d}무</span>}
                        <span className="pill l">{rec.l}패</span>
                      </span>
                    ) : (
                      t['최근10경기'] || '-'
                    )}
                  </td>
                  <td>
                    {isCurrent ? (
                      <span className={streak.includes('승') ? 'streak-w' : 'streak-l'}>
                        {streak}
                      </span>
                    ) : (
                      streak || '-'
                    )}
                  </td>
                  <td>{t['홈']}</td>
                  <td>{t['방문']}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="updated" style={{ marginTop: 12 }}>
        {isCurrent
          ? '팀 이름을 클릭하면 선수단 명단을 볼 수 있습니다 · '
          : `${year} 시즌 최종 순위 · `}
        게임차: 1위 팀과의 격차 · 홈/방문: 승-무-패 · 자세한 용어는{' '}
        <a href="#/glossary" style={{ textDecoration: 'underline' }}>
          용어 가이드
        </a>
        에서 확인하세요.
      </p>
    </>
  )
}
