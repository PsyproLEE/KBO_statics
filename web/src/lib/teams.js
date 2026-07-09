// KBO 10개 구단 메타 정보 — 기록 페이지의 팀 표기(짧은 이름) 기준
// code: 네이버/KBO CDN 로고 코드, abbr: 로고 없을 때 쓰는 배지 약칭
export const TEAMS = {
  삼성: { full: '삼성 라이온즈', color: '#3B7BD4', code: 'SS', abbr: '삼성' },
  한화: { full: '한화 이글스', color: '#F97316', code: 'HH', abbr: '한화' },
  LG: { full: 'LG 트윈스', color: '#D63C6C', code: 'LG', abbr: 'LG' },
  롯데: { full: '롯데 자이언츠', color: '#7D96CF', code: 'LT', abbr: '롯데' },
  KT: { full: 'KT 위즈', color: '#A7A9AC', code: 'KT', abbr: 'KT' },
  KIA: { full: 'KIA 타이거즈', color: '#E23B30', code: 'HT', abbr: 'KIA' },
  SSG: { full: 'SSG 랜더스', color: '#D9A441', code: 'SK', abbr: 'SSG' },
  NC: { full: 'NC 다이노스', color: '#4A90A4', code: 'NC', abbr: 'NC' },
  두산: { full: '두산 베어스', color: '#5B6BD5', code: 'OB', abbr: '두산' },
  키움: { full: '키움 히어로즈', color: '#B54A6E', code: 'WO', abbr: '키움' },
}

// 과거 구단 (역대 시즌 표시용). 진짜 옛 로고 이미지는 공식/자유 소스가 없어
// 기본은 구단 고유 색상의 SVG 엠블럼 배지로 표시한다. (후신 구단 로고로 대체하지 않음)
// logo: web/public/logos/hist/{slug}.png 가 있고 HIST_LOGO_READY에 등록되면 실제 로고 우선.
export const HISTORIC_TEAMS = {
  해태: { full: '해태 타이거즈', color: '#C8322B', abbr: '해태', logo: 'haitai' },
  OB: { full: 'OB 베어스', color: '#1F3A93', abbr: 'OB', logo: 'ob' },
  빙그레: { full: '빙그레 이글스', color: '#E8731C', abbr: '빙그레', logo: 'binggrae' },
  태평양: { full: '태평양 돌핀스', color: '#2F7DBE', abbr: '태평양', logo: 'taepyeong' },
  쌍방울: { full: '쌍방울 레이더스', color: '#B83028', abbr: '쌍방울', logo: 'ssangbangwool' },
  현대: { full: '현대 유니콘스', color: '#26808A', abbr: '현대', logo: 'hyundai' },
  MBC: { full: 'MBC 청룡', color: '#2E4FB0', abbr: 'MBC', logo: 'mbc' },
  삼미: { full: '삼미 슈퍼스타즈', color: '#C0392B', abbr: '삼미', logo: 'sammi' },
  청보: { full: '청보 핀토스', color: '#C85A2E', abbr: '청보', logo: 'chungbo' },
  SK: { full: 'SK 와이번스', color: '#D8402C', abbr: 'SK', logo: 'sk' },
  넥센: { full: '넥센 히어로즈', color: '#7A2E8E', abbr: '넥센', logo: 'nexen' },
  우리: { full: '우리 히어로즈', color: '#0E4DA4', abbr: '우리', logo: 'woori' },
  히어로즈: { full: '서울 히어로즈', color: '#7A2E8E', abbr: '히어로즈', logo: 'heroes' },
}

// 실제 로고 파일이 준비된 구단의 slug. web/public/logos/hist/{slug}.png 를 넣고
// 여기에 slug 를 추가하면 배지 대신 그 로고가 표시된다.
export const HIST_LOGO_READY = new Set([])

export function histLogoUrl(name) {
  const info = HISTORIC_TEAMS[name]
  if (!info || !info.logo || !HIST_LOGO_READY.has(info.logo)) return null
  return `${import.meta.env.BASE_URL}logos/hist/${info.logo}.png`
}

export function teamInfo(name) {
  return (
    TEAMS[name] ||
    (HISTORIC_TEAMS[name] && { ...HISTORIC_TEAMS[name], code: null }) || {
      full: name,
      color: '#8b93a7',
      code: null,
      abbr: (name || '?').slice(0, 3),
    }
  )
}

export function emblemUrl(name, season) {
  const { code } = teamInfo(name)
  if (!code) return null
  return `https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/emblem/regular/${season}/emblem_${code}.png`
}
