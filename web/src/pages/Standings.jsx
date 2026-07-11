import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData, num } from '../lib/data.jsx'
import { useSeason } from '../lib/useSeason.js'
import { useIsMobile } from '../lib/useMobile.js'
import { teamInfo } from '../lib/teams.js'
import { championOf } from '../lib/champions.js'
import TeamLogo from '../components/TeamLogo.jsx'
import SeasonPicker from '../components/SeasonPicker.jsx'

/** '9승0무1패' → {w,d,l} 뱃지용 파싱 */
function parseRecent(s) {
  const m = String(s).match(/(\d+)승(\d+)무(\d+)패/)
  if (!m) return null
  return { w: +m[1], d: +m[2], l: +m[3] }
}

// 모바일에서 순위·팀·승·패 뒤에 하나만 골라 보여줄 컬럼
const EXTRA_COLS = [
  { key: '승률', label: '승률' },
  { key: '게임차', label: '게임차' },
  { key: '최근10경기', label: '최근 10경기' },
  { key: '연속', label: '연속' },
  { key: '경기', label: '경기' },
  { key: '무', label: '무' },
  { key: '홈', label: '홈' },
  { key: '방문', label: '방문' },
]

export default function Standings() {
  const { meta } = useData()
  const { year, setYear, years, isCurrent, loading, standings } = useSeason()
  const isMobile = useIsMobile()
  const [col, setCol] = useState('승률')
  const maxPct = Math.max(...standings.map((t) => num(t['승률']) || 0))

  const recentCell = (t) => {
    const rec = isCurrent ? parseRecent(t['최근10경기']) : null
    return rec ? (
      <span className="recent">
        <span className="pill w">{rec.w}승</span>
        {rec.d > 0 && <span className="pill d">{rec.d}무</span>}
        <span className="pill l">{rec.l}패</span>
      </span>
    ) : (
      t['최근10경기'] || '-'
    )
  }

  const streakCell = (t) => {
    const s = t['연속'] || ''
    return isCurrent ? (
      <span className={s.includes('승') ? 'streak-w' : 'streak-l'}>{s}</span>
    ) : (
      s || '-'
    )
  }

  // 모바일 셀은 폭이 좁아 최근10경기는 뱃지 대신 텍스트로 (0무는 생략)
  const extraCell = (t, key) => {
    if (key === '최근10경기') return (t['최근10경기'] || '-').replace('0무', '')
    if (key === '연속') return streakCell(t)
    return t[key] ?? '-'
  }

  const teamCell = (t) => {
    const ks = championOf(year)
    const title =
      ks && ks.champ === t['팀명'] ? 'champ' : ks && ks.runnerUp === t['팀명'] ? 'ru' : null
    return (
      <Link to={`/team/${t['팀명']}`} state={{ year }} className="team-chip team-link">
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
      </Link>
    )
  }

  const wpctBar = (t) => {
    const pct = num(t['승률']) || 0
    return (
      <span className="wpct-bar">
        <span className="track">
          <span className="fill" style={{ width: `${(pct / maxPct) * 100}%` }} />
        </span>
        {t['승률']}
      </span>
    )
  }

  return (
    <>
      <div className="page-head">
        <h1>{year} KBO 리그 팀 순위</h1>
        <p style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <SeasonPicker year={year} years={years} onChange={setYear} loading={loading} />
          {isCurrent && <span className="updated">업데이트 {meta.updatedAt}</span>}
        </p>
      </div>

      {isMobile && (
        <div className="stat-picker">
          <span className="sp-label">항목 선택</span>
          <select value={col} onChange={(e) => setCol(e.target.value)}>
            {EXTRA_COLS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="card table-wrap">
        <table className="stat">
          {isMobile ? (
            <>
              <thead>
                <tr>
                  <th className="plain">순위</th>
                  <th className="plain left">팀</th>
                  <th className="plain">승</th>
                  <th className="plain">패</th>
                  <th className="plain sorted">
                    {EXTRA_COLS.find((c) => c.key === col)?.label}
                  </th>
                </tr>
              </thead>
              <tbody>
                {standings.map((t) => (
                  <tr key={t['팀명']}>
                    <td className={`rank-cell ${t['순위'] === '1' ? 'rank-1' : ''}`}>
                      {t['순위']}
                    </td>
                    <td className="left">{teamCell(t)}</td>
                    <td>{t['승']}</td>
                    <td>{t['패']}</td>
                    <td className="hl">{extraCell(t, col)}</td>
                  </tr>
                ))}
              </tbody>
            </>
          ) : (
            <>
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
                {standings.map((t) => (
                  <tr key={t['팀명']}>
                    <td className={`rank-cell ${t['순위'] === '1' ? 'rank-1' : ''}`}>
                      {t['순위']}
                    </td>
                    <td className="left">{teamCell(t)}</td>
                    <td>{t['경기']}</td>
                    <td>{t['승']}</td>
                    <td>{t['무']}</td>
                    <td>{t['패']}</td>
                    <td>{wpctBar(t)}</td>
                    <td>{t['게임차']}</td>
                    <td>{recentCell(t)}</td>
                    <td>{streakCell(t)}</td>
                    <td>{t['홈']}</td>
                    <td>{t['방문']}</td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
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
