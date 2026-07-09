import { useState, useEffect } from 'react'
import { useData } from '../lib/data.jsx'

const NAVER_CDN = 'https://sports-phinf.pstatic.net/player/kbo/default'
const KBO_CDN = 'https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle'

/**
 * 선수 프로필 사진.
 * - year(해당 시즌)가 과거면 그 해에 찍은 KBO 사진을 먼저 시도 → 없으면 최신 사진
 * - 현재 시즌이면 네이버 고화질(210×262)을 먼저
 * 폴백 체인 순서대로 로드 실패 시 다음 소스, 최종엔 이름 첫 글자.
 * 네이버 CDN은 referrer 있으면 403이라 no-referrer 필수.
 */
export default function PlayerPhoto({ src, pid, name, year, className = 'avatar' }) {
  const { meta } = useData()
  const naver = pid ? `${NAVER_CDN}/${pid}.png` : null
  const era = pid && year && year < meta.season ? `${KBO_CDN}/${year}/${pid}.jpg` : null

  // 과거 시즌: 당시 사진 우선 → 최신(네이버) → 프로필의 KBO 사진
  // 현재/미래 시즌: 네이버 고화질 우선 → 프로필 사진
  const sources = (era ? [era, naver, src] : [naver, src]).filter(Boolean)

  const [idx, setIdx] = useState(0)
  useEffect(() => {
    setIdx(0)
  }, [pid, year, src])

  if (idx >= sources.length)
    return <div className={`${className}-fallback`}>{(name || '?').slice(0, 1)}</div>

  return (
    <img
      className={className}
      src={sources[idx]}
      alt={name}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setIdx((i) => i + 1)}
    />
  )
}
