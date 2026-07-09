import { useState, useEffect } from 'react'
import { useData } from '../lib/data.jsx'
import { teamInfo, emblemUrl, histLogoUrl } from '../lib/teams.js'
import TeamBadge from './TeamBadge.jsx'

const NAVER_CDN = 'https://sports-phinf.pstatic.net/team/kbo/default'

/**
 * 팀 엠블럼. 현재 구단은 네이버(184×184)→KBO 공식 순으로 실제 로고를 쓰고,
 * 과거 구단은 준비된 실제 옛 로고 파일(있으면)→없으면 SVG 배지로 대체.
 */
export default function TeamLogo({ team, size = 24 }) {
  const { meta } = useData()
  const { code, full } = teamInfo(team)
  const sources = code
    ? [`${NAVER_CDN}/${code}.png`, emblemUrl(team, meta.season)].filter(Boolean)
    : [histLogoUrl(team)].filter(Boolean)
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    setIdx(0)
  }, [team])

  if (idx >= sources.length) return <TeamBadge team={team} size={size} />

  return (
    <span className="team-logo" style={{ width: size, height: size }}>
      <img
        src={sources[idx]}
        alt={full}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setIdx((i) => i + 1)}
      />
    </span>
  )
}
