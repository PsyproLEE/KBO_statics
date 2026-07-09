import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData, num, fmt } from '../lib/data.jsx'
import { teamInfo } from '../lib/teams.js'
import PlayerPhoto from '../components/PlayerPhoto.jsx'

// asc: true면 낮을수록 좋은 기록
const HITTER_STATS = [
  { key: 'G', label: '경기', neutral: true },
  { key: 'PA', label: '타석', neutral: true },
  { key: 'AVG', label: '타율' },
  { key: 'H', label: '안타' },
  { key: 'HR', label: '홈런' },
  { key: 'RBI', label: '타점' },
  { key: 'R', label: '득점' },
  { key: '2B', label: '2루타' },
  { key: 'BB', label: '볼넷' },
  { key: 'SO', label: '삼진', asc: true },
  { key: 'GDP', label: '병살타', asc: true },
  { key: 'OBP', label: '출루율' },
  { key: 'SLG', label: '장타율' },
  { key: 'OPS', label: 'OPS' },
  { key: 'RISP', label: '득점권 타율' },
]

const PITCHER_STATS = [
  { key: 'G', label: '경기', neutral: true },
  { key: 'IP', label: '이닝', neutral: true },
  { key: 'ERA', label: '평균자책점', asc: true },
  { key: 'W', label: '승' },
  { key: 'L', label: '패', asc: true },
  { key: 'SV', label: '세이브' },
  { key: 'HLD', label: '홀드' },
  { key: 'SO', label: '탈삼진' },
  { key: 'BB', label: '볼넷', asc: true },
  { key: 'WHIP', label: 'WHIP', asc: true },
  { key: 'QS', label: '퀄리티스타트' },
  { key: 'AVG', label: '피안타율', asc: true },
]

function Picker({ rows, players, selected, onPick, placeholder }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const q = query.trim()

  const matches = useMemo(() => {
    if (!q) return []
    return rows.filter((r) => r['선수명'].includes(q)).slice(0, 8)
  }, [rows, q])

  if (selected) {
    const p = players[selected.playerId] || {}
    return (
      <div className="picked">
        <PlayerPhoto
          src={p.photo}
          pid={selected.playerId}
          name={selected['선수명']}
          className="photo"
        />
        <div style={{ flex: 1 }}>
          <div style={{ color: teamInfo(selected['팀명']).color, fontSize: 12, fontWeight: 700 }}>
            {teamInfo(selected['팀명']).full}
          </div>
          <div style={{ fontWeight: 800, fontSize: 17 }}>
            {selected['선수명']}
            {p.backNo && (
              <span style={{ color: 'var(--text-3)', fontSize: 13, marginLeft: 6 }}>
                #{p.backNo}
              </span>
            )}
          </div>
          {p.position && (
            <div style={{ color: 'var(--text-2)', fontSize: 12.5 }}>{p.position}</div>
          )}
        </div>
        <button className="chip" onClick={() => onPick(null)}>
          변경
        </button>
      </div>
    )
  }

  return (
    <div className="picker">
      <input
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
      />
      {open && matches.length > 0 && (
        <div className="picker-list">
          {matches.map((r) => {
            const p = players[r.playerId] || {}
            return (
              <button
                key={r.playerId}
                className="picker-item"
                onClick={() => {
                  onPick(r)
                  setQuery('')
                  setOpen(false)
                }}
              >
                <PlayerPhoto src={p.photo} pid={r.playerId} name={r['선수명']} />
                <span className="name">{r['선수명']}</span>
                <span className="team">{r['팀명']}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Compare() {
  const { hitters, pitchers, players, meta } = useData()
  const [mode, setMode] = useState('hitter')
  const [a, setA] = useState(null)
  const [b, setB] = useState(null)

  const rows = mode === 'hitter' ? hitters : pitchers
  const stats = mode === 'hitter' ? HITTER_STATS : PITCHER_STATS

  const switchMode = (m) => {
    if (m === mode) return
    setMode(m)
    setA(null)
    setB(null)
  }

  const winner = (stat) => {
    if (!a || !b || stat.neutral) return 0
    const va = num(a[stat.key])
    const vb = num(b[stat.key])
    if (va == null || vb == null || va === vb) return 0
    const aWins = stat.asc ? va < vb : va > vb
    return aWins ? 1 : 2
  }

  return (
    <>
      <div className="page-head">
        <h1>선수 비교</h1>
        <p>
          같은 포지션 유형의 두 선수를 골라 기록을 나란히 비교해 보세요. 더 좋은 쪽이
          빨간색으로 표시됩니다. <span className="updated">업데이트 {meta.updatedAt}</span>
        </p>
      </div>

      <div className="chips">
        <button
          className={`chip ${mode === 'hitter' ? 'on' : ''}`}
          onClick={() => switchMode('hitter')}
        >
          타자 비교
        </button>
        <button
          className={`chip ${mode === 'pitcher' ? 'on' : ''}`}
          onClick={() => switchMode('pitcher')}
        >
          투수 비교
        </button>
      </div>

      <div className="compare-pickers">
        <Picker
          rows={rows}
          players={players}
          selected={a}
          onPick={setA}
          placeholder="첫 번째 선수 이름 검색"
        />
        <div className="vs">VS</div>
        <Picker
          rows={rows}
          players={players}
          selected={b}
          onPick={setB}
          placeholder="두 번째 선수 이름 검색"
        />
      </div>

      {a && b ? (
        <div className="card table-wrap" style={{ marginTop: 20 }}>
          <table className="stat compare-table">
            <thead>
              <tr>
                <th className="plain" style={{ width: '35%' }}>
                  <Link to={`/player/${a.playerId}`} style={{ color: 'var(--text)' }}>
                    {a['선수명']}
                  </Link>{' '}
                  <span style={{ color: 'var(--text-3)' }}>{a['팀명']}</span>
                </th>
                <th className="plain mid">기록</th>
                <th className="plain" style={{ width: '35%' }}>
                  <Link to={`/player/${b.playerId}`} style={{ color: 'var(--text)' }}>
                    {b['선수명']}
                  </Link>{' '}
                  <span style={{ color: 'var(--text-3)' }}>{b['팀명']}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => {
                const w = winner(s)
                return (
                  <tr key={s.key}>
                    <td className={w === 1 ? 'win' : ''}>{fmt(a[s.key])}</td>
                    <td className="mid">{s.label}</td>
                    <td className={w === 2 ? 'win' : ''}>{fmt(b[s.key])}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="load-state" style={{ padding: '60px 20px' }}>
          위에서 두 선수를 선택하면 비교표가 나타납니다.
          <br />
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
            예: {mode === 'hitter' ? '오스틴 vs 김도영' : '폰세 vs 최민석'}
          </span>
        </div>
      )}
    </>
  )
}
