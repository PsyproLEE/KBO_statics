import { useData, isQualifiedPitcher } from '../lib/data.jsx'
import { useSeason } from '../lib/useSeason.js'
import Leaderboard from '../components/Leaderboard.jsx'
import SeasonPicker from '../components/SeasonPicker.jsx'

const CATEGORIES = [
  { key: 'ERA', label: '평균자책점', asc: true, rate: true },
  { key: 'W', label: '승리' },
  { key: 'SO', label: '탈삼진' },
  { key: 'SV', label: '세이브' },
  { key: 'HLD', label: '홀드' },
  { key: 'WHIP', label: 'WHIP', asc: true, rate: true },
  { key: 'IP', label: '이닝' },
  { key: 'QS', label: '퀄리티스타트' },
]

const COLUMNS = [
  { key: 'ERA', label: '평균자책점' },
  { key: 'G', label: '경기' },
  { key: 'W', label: '승' },
  { key: 'L', label: '패' },
  { key: 'SV', label: '세이브' },
  { key: 'HLD', label: '홀드' },
  { key: 'IP', label: '이닝' },
  { key: 'SO', label: '탈삼진' },
  { key: 'BB', label: '볼넷' },
  { key: 'H', label: '피안타' },
  { key: 'HR', label: '피홈런' },
  { key: 'WHIP', label: 'WHIP' },
  { key: 'QS', label: 'QS' },
  { key: 'WPCT', label: '승률' },
]

export default function Pitchers() {
  const { meta } = useData()
  const { year, setYear, years, isCurrent, loading, pitchers, standings } = useSeason()
  return (
    <>
      <div className="page-head">
        <h1>{year} 투수 기록</h1>
        <p style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <SeasonPicker year={year} years={years} onChange={setYear} loading={loading} />
          <span>
            비율 기록은 규정이닝(팀 경기 수 × 1) 충족 선수만 순위에 올라갑니다.
          </span>
          {isCurrent && <span className="updated">업데이트 {meta.updatedAt}</span>}
        </p>
      </div>
      <Leaderboard
        key={year}
        rows={pitchers}
        standings={standings}
        season={year}
        categories={CATEGORIES}
        columns={COLUMNS}
        isQualified={isQualifiedPitcher}
      />
    </>
  )
}
