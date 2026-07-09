import { useMemo } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { useData, num, fmt } from '../lib/data.jsx'
import { useSeason } from '../lib/useSeason.js'
import { teamInfo } from '../lib/teams.js'
import PlayerPhoto from '../components/PlayerPhoto.jsx'
import TeamLogo from '../components/TeamLogo.jsx'
import SeasonPicker from '../components/SeasonPicker.jsx'

/** '내야수(우투우타)' → { group: '내야수', detail: '우투우타' } */
function parsePosition(pos) {
  if (!pos) return { group: null, detail: '' }
  const m = pos.match(/^([^(]+)(?:\(([^)]*)\))?/)
  return { group: m[1].trim(), detail: m[2] || '' }
}

const HITTER_GROUPS = ['포수', '내야수', '외야수', '지명타자']

function RosterCard({ row, profile, statLine, year }) {
  const { detail } = parsePosition(profile.position)
  return (
    <Link to={`/player/${row.playerId}`} state={{ row, year }} className="roster-card">
      <PlayerPhoto
        src={profile.photo}
        pid={row.playerId}
        name={row['선수명']}
        year={year}
        className="roster-photo"
      />
      <div className="roster-info">
        <div className="roster-name">
          {row['선수명']}
          {profile.backNo && <span className="roster-no">#{profile.backNo}</span>}
        </div>
        {detail && <div className="roster-pos">{detail}</div>}
        <div className="roster-stat">{statLine}</div>
      </div>
    </Link>
  )
}

export default function Team() {
  const { name } = useParams()
  const { state } = useLocation()
  const { players } = useData()
  const { year, setYear, years, isCurrent, loading, standings, hitters, pitchers } =
    useSeason(state?.year)

  const team = teamInfo(name)
  const standing = standings.find((t) => t['팀명'] === name)
  // 프로필(포지션·등번호)은 현재 선수만 있음 → 과거 시즌엔 사용하지 않음
  const profileFor = (id) => (isCurrent ? players[id] || {} : {})

  const teamPitchers = useMemo(
    () =>
      pitchers
        .filter((r) => r['팀명'] === name)
        .sort((a, b) => (num(b['IP']) ?? 0) - (num(a['IP']) ?? 0)),
    [pitchers, name],
  )

  const teamHitters = useMemo(
    () =>
      hitters
        .filter((r) => r['팀명'] === name)
        .sort((a, b) => (num(b['PA']) ?? 0) - (num(a['PA']) ?? 0)),
    [hitters, name],
  )

  // 현재 시즌은 포지션별로, 과거 시즌은 '타자' 한 그룹으로
  const hitterSections = useMemo(() => {
    if (!isCurrent) return [{ title: '타자', rows: teamHitters }]
    const groups = {}
    for (const r of teamHitters) {
      let { group } = parsePosition((players[r.playerId] || {}).position)
      if (group === '투수') continue
      if (!HITTER_GROUPS.includes(group)) group = '기타 야수'
      ;(groups[group] ??= []).push(r)
    }
    return [...HITTER_GROUPS, '기타 야수']
      .filter((g) => groups[g]?.length)
      .map((g) => ({ title: g, rows: groups[g] }))
  }, [teamHitters, players, isCurrent])

  const seasonTeams = standings.map((t) => t['팀명'])

  return (
    <>
      <div className="toolbar" style={{ marginTop: 28 }}>
        <SeasonPicker year={year} years={years} onChange={setYear} loading={loading} />
        <span className="note">해당 시즌 소속 선수 명단</span>
      </div>

      <div className="chips">
        {seasonTeams.map((t) => (
          <Link
            key={t}
            to={`/team/${t}`}
            className={`chip chip-logo ${t === name ? 'on' : ''}`}
          >
            <TeamLogo team={t} size={18} />
            {t}
          </Link>
        ))}
      </div>

      {!standing ? (
        <div className="load-state">
          {year} 시즌엔 <b>{team.full}</b> 기록이 없습니다.
          <br />
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            위에서 다른 시즌이나 팀을 선택하세요.
          </span>
        </div>
      ) : (
        <>
          <div
            className="player-hero"
            style={{
              background: `radial-gradient(600px 220px at 15% 0%, ${team.color}22, transparent), var(--card)`,
            }}
          >
            <TeamLogo team={name} size={96} />
            <div style={{ flex: 1, minWidth: 240 }}>
              <h1 style={{ display: 'block' }}>
                <span style={{ color: team.color }}>{standing['순위']}위</span> {team.full}
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 15,
                    color: 'var(--ink-3)',
                    marginLeft: 10,
                  }}
                >
                  {year}
                </span>
              </h1>
              <div className="profile-grid" style={{ maxWidth: 560 }}>
                <div>
                  <div className="label">시즌 성적</div>
                  <div>
                    {standing['승']}승 {standing['무']}무 {standing['패']}패
                  </div>
                </div>
                <div>
                  <div className="label">승률</div>
                  <div>{standing['승률']}</div>
                </div>
                <div>
                  <div className="label">게임차</div>
                  <div>{standing['게임차']}</div>
                </div>
                <div>
                  <div className="label">최근 10경기</div>
                  <div>{standing['최근10경기']}</div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="section-title">
            투수{' '}
            <span className="badge-note">{teamPitchers.length}명 · 이닝 많은 순</span>
          </h2>
          <div className="roster-grid">
            {teamPitchers.map((r) => (
              <RosterCard
                key={r.playerId}
                row={r}
                profile={profileFor(r.playerId)}
                year={year}
                statLine={`ERA ${fmt(r['ERA'])} · ${fmt(r['IP'])}이닝 · ${fmt(r['SO'])}K`}
              />
            ))}
          </div>

          {hitterSections.map((sec) => (
            <section key={sec.title}>
              <h2 className="section-title">
                {sec.title}{' '}
                <span className="badge-note">{sec.rows.length}명 · 타석 많은 순</span>
              </h2>
              <div className="roster-grid">
                {sec.rows.map((r) => (
                  <RosterCard
                    key={r.playerId}
                    row={r}
                    profile={profileFor(r.playerId)}
                    year={year}
                    statLine={`타율 ${fmt(r['AVG'])} · ${fmt(r['HR'])}홈런 · ${fmt(r['RBI'])}타점`}
                  />
                ))}
              </div>
            </section>
          ))}

          <p className="updated" style={{ marginTop: 20 }}>
            {isCurrent ? '올 시즌 1군 기록이 있는 선수 기준' : `${year} 시즌 기록 기준`}
          </p>
        </>
      )}
    </>
  )
}
