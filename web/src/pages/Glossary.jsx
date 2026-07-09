import { useState } from 'react'

const SECTIONS = [
  {
    title: '⚾ 기본 중의 기본',
    terms: [
      {
        abbr: 'PA / AB',
        term: '타석 / 타수',
        desc: '타석(PA)은 타자가 타석에 들어선 모든 횟수. 타수(AB)는 거기서 볼넷·몸에 맞는 공·희생타를 뺀, "제대로 승부한" 횟수예요. 타율은 타수 기준으로 계산합니다.',
        ex: '5번 타석에 들어서 볼넷 1개를 얻었다면 → 타석 5, 타수 4',
      },
      {
        abbr: 'AVG',
        term: '타율',
        desc: '타수 대비 안타 비율. 야구에서 가장 유명한 기록으로, 3할(0.300)이면 강타자 소리를 듣습니다.',
        ex: '10번 쳐서 3번 안타면 타율 <b>0.300</b> — "열 번 중 세 번 성공"',
      },
      {
        abbr: 'H',
        term: '안타',
        desc: '공을 쳐서 아웃되지 않고 베이스에 나간 것. 1루타·2루타(2B)·3루타(3B)·홈런이 모두 안타에 포함됩니다.',
      },
      {
        abbr: 'HR',
        term: '홈런',
        desc: '담장을 넘겨 한 번에 홈까지 들어오는 타구. 베이스에 있던 주자도 모두 득점하는, 야구의 꽃입니다.',
      },
      {
        abbr: 'RBI',
        term: '타점',
        desc: '내 타격으로 우리 팀 주자가 홈을 밟으면 얻는 점수. "찬스에 강한 타자"를 보여주는 기록이에요.',
        ex: '주자 2명이 있을 때 홈런을 치면 타점 <b>3</b> (주자 2명 + 나)',
      },
      {
        abbr: 'R',
        term: '득점',
        desc: '내가 직접 홈을 밟아 점수를 낸 횟수. 잘 나가고(출루) 잘 뛰는 선수가 많이 쌓습니다.',
      },
    ],
  },
  {
    title: '🏏 타자 기록 더 보기',
    terms: [
      {
        abbr: 'OBP',
        term: '출루율',
        desc: '안타든 볼넷이든 어떻게든 베이스에 나간 비율. 타율보다 "아웃 안 당하는 능력"을 더 정확히 보여줘요. 0.400 이상이면 리그 최상급.',
      },
      {
        abbr: 'SLG',
        term: '장타율',
        desc: '안타의 "질"을 보는 기록. 1루타는 1점, 2루타는 2점, 홈런은 4점으로 계산해 타수로 나눕니다. 높을수록 장타력이 좋은 타자.',
      },
      {
        abbr: 'OPS',
        term: 'OPS',
        desc: '출루율 + 장타율. "잘 나가고 + 멀리 치는" 능력을 한 숫자로 합친 종합 공격력 지표. 요즘 야구에서 타자를 평가하는 대표 기준이에요.',
        ex: 'OPS <b>0.800</b> 이상이면 좋은 타자, <b>0.900</b> 이상이면 리그 정상급',
      },
      {
        abbr: 'BB / HBP',
        term: '볼넷 / 몸에 맞는 공',
        desc: '볼 4개를 골라내면 볼넷(BB), 투수의 공에 맞으면 몸에 맞는 공(HBP). 둘 다 공짜로 1루에 나갑니다. IBB는 투수가 일부러 내보내는 고의사구.',
      },
      {
        abbr: 'SO',
        term: '삼진',
        desc: '스트라이크 3개로 아웃되는 것. 타자에겐 적을수록 좋습니다.',
      },
      {
        abbr: 'GDP',
        term: '병살타',
        desc: '내 타구 하나로 아웃 2개가 한꺼번에 잡히는 최악의 결과. 주로 1루에 주자가 있을 때 내야 땅볼에서 나옵니다.',
      },
      {
        abbr: 'RISP',
        term: '득점권 타율',
        desc: '주자가 2루나 3루(= 안타 하나면 득점 가능한 위치)에 있을 때의 타율. "클러치 능력"이라고도 해요.',
      },
      {
        abbr: 'MH',
        term: '멀티히트',
        desc: '한 경기에서 안타를 2개 이상 친 경기 수.',
      },
      {
        abbr: 'SAC / SF',
        term: '희생번트 / 희생플라이',
        desc: '나는 아웃되는 대신 주자를 진루·득점시키는 팀 플레이. 타수에 포함되지 않아 타율이 깎이지 않습니다.',
      },
      {
        abbr: 'TB',
        term: '루타',
        desc: '안타로 확보한 베이스 수의 합계. 1루타 1, 2루타 2, 3루타 3, 홈런 4로 계산합니다.',
      },
    ],
  },
  {
    title: '🥎 투수 기록',
    terms: [
      {
        abbr: 'ERA',
        term: '평균자책점',
        desc: '9이닝(한 경기 분량)을 던졌을 때 투수 책임으로 내주는 평균 점수. 투수 기록의 대표 지표로, 낮을수록 좋습니다.',
        ex: 'ERA <b>3.00</b> = 한 경기를 다 던지면 평균 3점을 내주는 투수. 2점대면 에이스급',
      },
      {
        abbr: 'W / L',
        term: '승 / 패',
        desc: '팀이 이길 때 가장 큰 기여를 한 투수에게 승리가, 역전을 허용한 투수에게 패전이 기록됩니다.',
      },
      {
        abbr: 'SV',
        term: '세이브',
        desc: '이기고 있는 경기의 마지막을 지켜내면 얻는 기록. 주로 팀의 최고 불펜 투수인 "마무리 투수"가 쌓습니다.',
      },
      {
        abbr: 'HLD',
        term: '홀드',
        desc: '이기는 상황을 중간에서 무사히 다음 투수에게 넘겨주면 얻는 기록. 중간계투(셋업맨)의 성적표예요.',
      },
      {
        abbr: 'IP',
        term: '이닝',
        desc: '던진 이닝 수. 아웃 1개 = 1/3이닝이라 "92 2/3" 같은 표기가 나옵니다(92이닝 + 아웃 2개).',
      },
      {
        abbr: 'SO',
        term: '탈삼진',
        desc: '투수가 타자를 삼진으로 잡은 개수. 구위가 좋은 투수일수록 많습니다.',
      },
      {
        abbr: 'WHIP',
        term: 'WHIP',
        desc: '이닝당 내보낸 주자 수(안타 + 볼넷). "한 이닝에 몇 명을 내보내는가"로, 낮을수록 안정적인 투수입니다.',
        ex: 'WHIP <b>1.20</b> 이하면 우수, <b>1.00</b> 이하면 특급',
      },
      {
        abbr: 'QS',
        term: '퀄리티스타트',
        desc: '선발 투수가 6이닝 이상을 3자책점 이하로 막은 경기. "선발이 제 몫을 했다"의 기준입니다.',
      },
      {
        abbr: 'CG / SHO',
        term: '완투 / 완봉',
        desc: '완투(CG)는 한 경기를 혼자 다 던진 것, 완봉(SHO)은 거기에 실점까지 0인 것. 요즘은 보기 드문 대기록이에요.',
      },
      {
        abbr: 'BSV',
        term: '블론세이브',
        desc: '세이브 상황에서 동점·역전을 허용해 세이브를 날린 것. 마무리 투수에겐 적을수록 좋습니다.',
      },
      {
        abbr: 'R / ER',
        term: '실점 / 자책점',
        desc: '실점(R)은 내준 모든 점수, 자책점(ER)은 그중 수비 실책 없이 순수하게 투수 책임인 점수. ERA는 자책점으로 계산합니다.',
      },
      {
        abbr: 'WP / BK',
        term: '폭투 / 보크',
        desc: '폭투(WP)는 포수가 잡을 수 없게 빠진 공, 보크(BK)는 투구 동작 반칙. 둘 다 주자가 공짜로 진루합니다.',
      },
    ],
  },
  {
    title: '🏆 팀 순위표 용어',
    terms: [
      {
        abbr: '승률',
        term: '승률',
        desc: '승 ÷ (승 + 패). 무승부는 계산에서 빠집니다. KBO 순위는 승률 순서로 매겨져요.',
        ex: '50승 31패면 승률 50 ÷ 81 = <b>0.617</b>',
      },
      {
        abbr: '게임차',
        term: '게임차',
        desc: '1위 팀을 따라잡으려면 몇 경기를 더 이겨야 하는지 나타내는 격차. 0이면 1위와 동률입니다.',
      },
      {
        abbr: '연속',
        term: '연속 (연승/연패)',
        desc: '현재 몇 경기 연속으로 이기고(승) 있는지, 지고(패) 있는지를 표시합니다.',
      },
      {
        abbr: '규정타석',
        term: '규정타석 / 규정이닝',
        desc: '타율·평균자책점 같은 비율 기록의 순위에 오르려면 채워야 하는 최소 출전량. 규정타석 = 팀 경기 수 × 3.1, 규정이닝 = 팀 경기 수 × 1. 몇 경기만 잘한 선수가 1위가 되는 걸 막기 위한 장치예요.',
        ex: '팀이 83경기를 치렀다면 규정타석은 83 × 3.1 ≈ <b>258타석</b>',
      },
    ],
  },
]

export default function Glossary() {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const filtered = SECTIONS.map((s) => ({
    ...s,
    terms: q
      ? s.terms.filter(
          (t) =>
            t.term.toLowerCase().includes(q) ||
            t.abbr.toLowerCase().includes(q) ||
            t.desc.toLowerCase().includes(q),
        )
      : s.terms,
  })).filter((s) => s.terms.length > 0)

  return (
    <>
      <div className="page-head">
        <h1>야구 기록 용어 가이드</h1>
        <p>처음 보는 알파벳 약어, 여기서 다 풀어드립니다. 초보자 눈높이 설명 + 예시.</p>
      </div>

      <div className="toolbar">
        <input
          placeholder="용어 검색 (예: OPS, 타율, 세이브)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ minWidth: 260 }}
        />
      </div>

      {filtered.map((s) => (
        <section key={s.title}>
          <h2 className="section-title">{s.title}</h2>
          <div className="gloss-grid">
            {s.terms.map((t) => (
              <div className="gloss-card" key={t.abbr + t.term}>
                <div>
                  <span className="abbr">{t.abbr}</span>
                  <span className="term">{t.term}</span>
                </div>
                <p>{t.desc}</p>
                {t.ex && (
                  <div className="ex" dangerouslySetInnerHTML={{ __html: t.ex }} />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
      {filtered.length === 0 && (
        <div className="load-state">'{query}' 검색 결과가 없습니다.</div>
      )}
    </>
  )
}
