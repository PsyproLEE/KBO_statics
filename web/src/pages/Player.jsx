import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useData, fmt, loadCareers } from '../lib/data.jsx'
import { teamInfo } from '../lib/teams.js'
import PlayerPhoto from '../components/PlayerPhoto.jsx'
import TeamLogo from '../components/TeamLogo.jsx'

const HITTER_TILES = [
  { key: 'AVG', label: '타율' },
  { key: 'HR', label: '홈런' },
  { key: 'RBI', label: '타점' },
  { key: 'OPS', label: 'OPS' },
]

const PITCHER_TILES = [
  { key: 'ERA', label: '평균자책점' },
  { key: 'W', label: '승리' },
  { key: 'SO', label: '탈삼진' },
  { key: 'WHIP', label: 'WHIP' },
]

const HITTER_FULL = [
  ['G', '경기'], ['PA', '타석'], ['AB', '타수'], ['R', '득점'], ['H', '안타'],
  ['2B', '2루타'], ['3B', '3루타'], ['HR', '홈런'], ['TB', '루타'], ['RBI', '타점'],
  ['BB', '볼넷'], ['IBB', '고의사구'], ['HBP', '몸에 맞는 공'], ['SO', '삼진'],
  ['GDP', '병살타'], ['SAC', '희생번트'], ['SF', '희생플라이'], ['AVG', '타율'],
  ['OBP', '출루율'], ['SLG', '장타율'], ['OPS', 'OPS'], ['MH', '멀티히트'],
  ['RISP', '득점권 타율'], ['PH-BA', '대타 타율'],
]

const PITCHER_FULL = [
  ['G', '경기'], ['W', '승'], ['L', '패'], ['SV', '세이브'], ['HLD', '홀드'],
  ['WPCT', '승률'], ['IP', '이닝'], ['H', '피안타'], ['HR', '피홈런'], ['BB', '볼넷'],
  ['HBP', '사구'], ['SO', '탈삼진'], ['R', '실점'], ['ER', '자책점'], ['ERA', '평균자책점'],
  ['WHIP', 'WHIP'], ['CG', '완투'], ['SHO', '완봉'], ['QS', '퀄리티스타트'],
  ['BSV', '블론세이브'], ['TBF', '상대 타자 수'], ['NP', '투구 수'], ['AVG', '피안타율'],
  ['WP', '폭투'], ['BK', '보크'],
]

// 연도별 기록 표 헤더 라벨 (컨텍스트에 따라 같은 약어도 뜻이 다름)
const CAREER_LABELS = {
  hitter: {
    연도: '연도', 팀명: '팀', AVG: '타율', G: '경기', PA: '타석', AB: '타수',
    R: '득점', H: '안타', '2B': '2루타', '3B': '3루타', HR: '홈런', TB: '루타',
    RBI: '타점', SB: '도루', CS: '도루자', BB: '볼넷', HBP: '사구', SO: '삼진',
    GDP: '병살', SLG: '장타율', OBP: '출루율', E: '실책',
  },
  pitcher: {
    연도: '연도', 팀명: '팀', ERA: '평균자책', G: '경기', CG: '완투', SHO: '완봉',
    W: '승', L: '패', SV: '세이브', HLD: '홀드', WPCT: '승률', TBF: '타자수',
    IP: '이닝', H: '피안타', HR: '피홈런', BB: '볼넷', HBP: '사구', SO: '탈삼진',
    R: '실점', ER: '자책점',
  },
}

function CareerTable({ career, kind }) {
  const labels = CAREER_LABELS[kind]
  const cols = career.columns
  return (
    <div className="card table-wrap">
      <table className="stat">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} className="plain" title={c}>
                {labels[c] || c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {career.rows.map((row) => (
            <tr key={row['연도']}>
              {cols.map((c) => (
                <td key={c} className={c === '연도' ? 'rank-cell' : ''}>
                  {fmt(row[c])}
                </td>
              ))}
            </tr>
          ))}
          {career.total && (
            <tr className="total-row">
              <td colSpan={2}>통산</td>
              {cols.slice(2).map((c) => (
                <td key={c}>{fmt(career.total[c])}</td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function StatGrid({ row, defs }) {
  return (
    <div className="card table-wrap">
      <table className="stat">
        <thead>
          <tr>
            {defs.map(([k, label]) => (
              <th key={k} className="plain" title={k}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {defs.map(([k]) => (
              <td key={k}>{fmt(row[k])}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function Player() {
  const { id } = useParams()
  const { state } = useLocation()
  const { hitters, pitchers, players, meta } = useData()
  const [careers, setCareers] = useState(null)

  useEffect(() => {
    let alive = true
    loadCareers()
      .then((c) => alive && setCareers(c))
      .catch(() => alive && setCareers({}))
    return () => {
      alive = false
    }
  }, [])

  const profile = players[id] || {}
  const hit = hitters.find((r) => r.playerId === id)
  const pit = pitchers.find((r) => r.playerId === id)
  // 과거 시즌 리더보드에서 넘어온 (현재 명단에 없는) 선수는 라우터 state의 행 정보 사용
  const stateRow = state?.row?.playerId === id ? state.row : null
  const anyRow = hit || pit || stateRow

  if (!anyRow && !profile.name)
    return (
      <div className="load-state">
        선수 정보를 찾을 수 없습니다.
        <br />
        <Link to="/" style={{ textDecoration: 'underline' }}>
          홈으로 돌아가기
        </Link>
      </div>
    )

  const name = profile.name || anyRow?.['선수명'] || '이름 미상'
  const teamShort = (hit || pit)?.['팀명']
  const team = teamShort ? teamInfo(teamShort) : null
  // 과거 시즌에서 넘어온 선수의 당시 소속팀/시즌
  const pastTeam = !teamShort && stateRow ? teamInfo(stateRow['팀명']) : null
  const stateYear = state?.year
  const stateKind = stateRow && (stateRow['PA'] !== undefined ? 'hitter' : 'pitcher')

  const profileRows = [
    ['포지션', profile.position],
    ['생년월일', profile.birth],
    ['신장/체중', profile.body],
    ['입단', profile.debut],
    ['경력', profile.career],
  ].filter(([, v]) => v)

  return (
    <>
      <div className="player-hero">
        <PlayerPhoto src={profile.photo} pid={id} name={name} year={stateYear} className="big-photo" />
        <div style={{ flex: 1, minWidth: 240 }}>
          {team && (
            <Link
              to={`/team/${teamShort}`}
              style={{
                color: team.color,
                fontWeight: 700,
                fontSize: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <TeamLogo team={teamShort} size={20} />
              {team.full} →
            </Link>
          )}
          {pastTeam && (
            <span style={{ color: pastTeam.color, fontWeight: 700, fontSize: 14 }}>
              {pastTeam.full}
              {stateYear ? ` (${stateYear})` : ''}
            </span>
          )}
          <h1>
            {name}
            {profile.backNo && profile.backNo !== 'No.' && (
              <span className="backno">No.{profile.backNo.replace('No.', '').trim()}</span>
            )}
          </h1>
          <div className="profile-grid">
            {profileRows.map(([label, v]) => (
              <div key={label}>
                <div className="label">{label}</div>
                <div>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {hit && (
        <>
          <h2 className="section-title">
            {meta.season} 타자 성적
            <span className="badge-note">{hit['PA']}타석</span>
          </h2>
          <div className="tiles">
            {HITTER_TILES.map((t) => (
              <div className="tile" key={t.key}>
                <div className="label">{t.label}</div>
                <div className="value">{fmt(hit[t.key])}</div>
              </div>
            ))}
          </div>
          <StatGrid row={hit} defs={HITTER_FULL} />
        </>
      )}

      {pit && (
        <>
          <h2 className="section-title">
            {meta.season} 투수 성적
            <span className="badge-note">{pit['IP']}이닝</span>
          </h2>
          <div className="tiles">
            {PITCHER_TILES.map((t) => (
              <div className="tile" key={t.key}>
                <div className="label">{t.label}</div>
                <div className="value">{fmt(pit[t.key])}</div>
              </div>
            ))}
          </div>
          <StatGrid row={pit} defs={PITCHER_FULL} />
        </>
      )}

      {!hit && !pit && stateRow && (
        <>
          <h2 className="section-title">
            {stateYear ? `${stateYear} ` : ''}
            {stateKind === 'hitter' ? '타자' : '투수'} 성적
          </h2>
          <div className="tiles">
            {(stateKind === 'hitter' ? HITTER_TILES : PITCHER_TILES).map((t) => (
              <div className="tile" key={t.key}>
                <div className="label">{t.label}</div>
                <div className="value">{fmt(stateRow[t.key])}</div>
              </div>
            ))}
          </div>
          <StatGrid
            row={stateRow}
            defs={stateKind === 'hitter' ? HITTER_FULL : PITCHER_FULL}
          />
        </>
      )}

      {careers === null && (
        <p className="updated" style={{ marginTop: 20 }}>연도별 기록 불러오는 중…</p>
      )}
      {careers?.[id]?.hitter && (
        <>
          <h2 className="section-title">연도별 타자 기록</h2>
          <CareerTable career={careers[id].hitter} kind="hitter" />
        </>
      )}
      {careers?.[id]?.pitcher && (
        <>
          <h2 className="section-title">연도별 투수 기록</h2>
          <CareerTable career={careers[id].pitcher} kind="pitcher" />
        </>
      )}

      {anyRow?.detailUrl && (
        <p className="updated" style={{ marginTop: 16 }}>
          더 자세한 기록:{' '}
          <a
            href={anyRow.detailUrl}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'underline' }}
          >
            KBO 공식 선수 페이지
          </a>
        </p>
      )}

      <Link to={hit ? '/hitters' : '/pitchers'} className="back-link">
        ← 기록실로 돌아가기
      </Link>
    </>
  )
}
