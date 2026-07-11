import { useEffect, useState } from 'react'

/** 화면 폭이 bp 이하(모바일)인지 여부 — 리사이즈에 반응 */
export function useIsMobile(bp = 640) {
  const query = `(max-width: ${bp}px)`
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMobile(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return mobile
}
