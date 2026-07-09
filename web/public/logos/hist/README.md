# 과거 구단 로고 (드롭인)

사라진 구단(해태·태평양·쌍방울 등)의 실제 옛 로고 이미지는 공식/자유 배포
소스가 없어(위키백과에도 비자유·공정이용 파일로만 존재), 기본은 구단 색상
SVG 배지로 표시합니다.

## 실제 로고를 넣으려면

1. 이 폴더(`web/public/logos/hist/`)에 아래 파일명으로 PNG를 넣습니다
   (배경 투명 권장, 정사각형에 가까울수록 좋음, 128px 이상).
2. `web/src/lib/teams.js` 의 `HIST_LOGO_READY` 집합에 해당 slug 를 추가합니다.

넣으면 배지 대신 그 로고가 순위표·리더보드·구단 페이지 전체에 자동 반영됩니다.

## 구단별 파일명(slug)

| 구단 | 파일명 |
|---|---|
| 해태 타이거즈 | `haitai.png` |
| OB 베어스 | `ob.png` |
| 빙그레 이글스 | `binggrae.png` |
| 태평양 돌핀스 | `taepyeong.png` |
| 쌍방울 레이더스 | `ssangbangwool.png` |
| 현대 유니콘스 | `hyundai.png` |
| MBC 청룡 | `mbc.png` |
| 삼미 슈퍼스타즈 | `sammi.png` |
| 청보 핀토스 | `chungbo.png` |
| SK 와이번스 | `sk.png` |
| 넥센 히어로즈 | `nexen.png` |
| 우리 히어로즈 | `woori.png` |
| 서울 히어로즈 | `heroes.png` |

예) 해태 로고를 넣었다면:
`teams.js` → `export const HIST_LOGO_READY = new Set(['haitai'])`
