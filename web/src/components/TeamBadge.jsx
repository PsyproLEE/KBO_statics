import { teamInfo } from '../lib/teams.js'

/** hex 색을 어둡게 (rim 용) */
function darken(hex, f = 0.72) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.round(((n >> 16) & 255) * f)
  const g = Math.round(((n >> 8) & 255) * f)
  const b = Math.round((n & 255) * f)
  return `rgb(${r},${g},${b})`
}

/**
 * 로고 이미지가 없는 (주로 과거) 구단을 위한 SVG 엠블럼 배지.
 * 구단 고유색 원판 + 어두운 테두리 + 팀 약칭. 항상 오프라인 렌더 가능.
 */
export default function TeamBadge({ team, size = 24 }) {
  const { color, abbr, full } = teamInfo(team)
  const label = (abbr || (full || '?')).slice(0, 3)
  // 글자 수에 따라 폰트 크기 조절 (원 안에 맞도록) — viewBox 40 기준 비율
  const fsRatio = label.length >= 3 ? 0.265 : label.length === 2 ? 0.42 : 0.52

  return (
    <span
      className="team-badge"
      style={{ width: size, height: size }}
      title={full}
      aria-label={full}
    >
      <svg viewBox="0 0 40 40" width={size} height={size} role="img">
        <circle cx="20" cy="20" r="19" fill={color} stroke={darken(color)} strokeWidth="2" />
        <text
          x="20"
          y="21"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fff"
          fontWeight="800"
          fontSize={fsRatio * 40}
          fontFamily="Pretendard, 'Noto Sans KR', sans-serif"
          letterSpacing="-0.8"
        >
          {label}
        </text>
      </svg>
    </span>
  )
}
