import { useData, isQualifiedHitter } from '../lib/data.jsx'
import { useSeason } from '../lib/useSeason.js'
import Leaderboard from '../components/Leaderboard.jsx'
import SeasonPicker from '../components/SeasonPicker.jsx'

const CATEGORIES = [
  { key: 'AVG', label: '타율', rate: true },
  { key: 'HR', label: '홈런' },
  { key: 'RBI', label: '타점' },
  { key: 'H', label: '안타' },
  { key: 'R', label: '득점' },
  { key: 'OPS', label: 'OPS', rate: true },
  { key: 'OBP', label: '출루율', rate: true },
  { key: 'SLG', label: '장타율', rate: true },
]

const COLUMNS = [
  { key: 'AVG', label: '타율' },
  { key: 'G', label: '경기' },
  { key: 'PA', label: '타석' },
  { key: 'AB', label: '타수' },
  { key: 'H', label: '안타' },
  { key: 'HR', label: '홈런' },
  { key: 'RBI', label: '타점' },
  { key: 'R', label: '득점' },
  { key: '2B', label: '2루타' },
  { key: '3B', label: '3루타' },
  { key: 'BB', label: '볼넷' },
  { key: 'SO', label: '삼진' },
  { key: 'OBP', label: '출루율' },
  { key: 'SLG', label: '장타율' },
  { key: 'OPS', label: 'OPS' },
]

export default function Hitters() {
  const { meta } = useData()
  const { year, setYear, years, isCurrent, loading, hitters, standings } = useSeason()
  return (
    <>
      <div className="page-head">
        <h1>{year} 타자 기록</h1>
        <p style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <SeasonPicker year={year} years={years} onChange={setYear} loading={loading} />
          <span>
            비율 기록은 규정타석(팀 경기 수 × 3.1) 충족 선수만 순위에 올라갑니다.
          </span>
          {isCurrent && <span className="updated">업데이트 {meta.updatedAt}</span>}
        </p>
      </div>
      <Leaderboard
        key={year}
        rows={hitters}
        standings={standings}
        season={year}
        categories={CATEGORIES}
        columns={COLUMNS}
        isQualified={isQualifiedHitter}
      />
    </>
  )
}
