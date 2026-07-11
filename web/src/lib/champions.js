// 역대 KBO 한국시리즈 우승/준우승 (1982~2025)
// 출처: KBO 공식 기록(한국시리즈 결과). 팀명은 사이트 표기(짧은 이름) 기준.
// champ: 우승, runnerUp: 준우승(1985는 통합우승으로 한국시리즈 미개최 → null)
export const CHAMPIONS = [
  { year: 2025, champ: 'LG', runnerUp: '한화', result: '4승 1패' },
  { year: 2024, champ: 'KIA', runnerUp: '삼성', result: '4승 1패' },
  { year: 2023, champ: 'LG', runnerUp: 'KT', result: '4승 1패' },
  { year: 2022, champ: 'SSG', runnerUp: '키움', result: '4승 2패' },
  { year: 2021, champ: 'KT', runnerUp: '두산', result: '4승 0패' },
  { year: 2020, champ: 'NC', runnerUp: '두산', result: '4승 2패' },
  { year: 2019, champ: '두산', runnerUp: '키움', result: '4승 0패' },
  { year: 2018, champ: 'SK', runnerUp: '두산', result: '4승 2패' },
  { year: 2017, champ: 'KIA', runnerUp: '두산', result: '4승 1패' },
  { year: 2016, champ: '두산', runnerUp: 'NC', result: '4승 0패' },
  { year: 2015, champ: '두산', runnerUp: '삼성', result: '4승 1패' },
  { year: 2014, champ: '삼성', runnerUp: '넥센', result: '4승 2패' },
  { year: 2013, champ: '삼성', runnerUp: '두산', result: '4승 3패' },
  { year: 2012, champ: '삼성', runnerUp: 'SK', result: '4승 2패' },
  { year: 2011, champ: '삼성', runnerUp: 'SK', result: '4승 1패' },
  { year: 2010, champ: 'SK', runnerUp: '삼성', result: '4승 0패' },
  { year: 2009, champ: 'KIA', runnerUp: 'SK', result: '4승 3패' },
  { year: 2008, champ: 'SK', runnerUp: '두산', result: '4승 1패' },
  { year: 2007, champ: 'SK', runnerUp: '두산', result: '4승 2패' },
  { year: 2006, champ: '삼성', runnerUp: '한화', result: '4승 1패' },
  { year: 2005, champ: '삼성', runnerUp: '두산', result: '4승 0패' },
  { year: 2004, champ: '현대', runnerUp: '삼성', result: '4승 2패 3무' },
  { year: 2003, champ: '현대', runnerUp: 'SK', result: '4승 3패' },
  { year: 2002, champ: '삼성', runnerUp: 'LG', result: '4승 2패' },
  { year: 2001, champ: '두산', runnerUp: '삼성', result: '4승 2패' },
  { year: 2000, champ: '현대', runnerUp: '두산', result: '4승 3패' },
  { year: 1999, champ: '한화', runnerUp: '롯데', result: '4승 1패' },
  { year: 1998, champ: '현대', runnerUp: 'LG', result: '4승 2패' },
  { year: 1997, champ: '해태', runnerUp: 'LG', result: '4승 1패' },
  { year: 1996, champ: '해태', runnerUp: '현대', result: '4승 2패' },
  { year: 1995, champ: 'OB', runnerUp: '롯데', result: '4승 3패' },
  { year: 1994, champ: 'LG', runnerUp: '태평양', result: '4승 0패' },
  { year: 1993, champ: '해태', runnerUp: '삼성', result: '4승 2패 1무' },
  { year: 1992, champ: '롯데', runnerUp: '빙그레', result: '4승 1패' },
  { year: 1991, champ: '해태', runnerUp: '빙그레', result: '4승 0패' },
  { year: 1990, champ: 'LG', runnerUp: '삼성', result: '4승 0패' },
  { year: 1989, champ: '해태', runnerUp: '빙그레', result: '4승 1패' },
  { year: 1988, champ: '해태', runnerUp: '빙그레', result: '4승 2패' },
  { year: 1987, champ: '해태', runnerUp: '삼성', result: '4승 0패' },
  { year: 1986, champ: '해태', runnerUp: '삼성', result: '4승 1패' },
  { year: 1985, champ: '삼성', runnerUp: null, result: '통합우승 (한국시리즈 미개최)' },
  { year: 1984, champ: '롯데', runnerUp: '삼성', result: '4승 3패' },
  { year: 1983, champ: '해태', runnerUp: 'MBC', result: '4승 0패 1무' },
  { year: 1982, champ: 'OB', runnerUp: '삼성', result: '4승 1패' },
]

/** 연도 → {champ, runnerUp, result} */
const BY_YEAR = Object.fromEntries(CHAMPIONS.map((c) => [c.year, c]))
export function championOf(year) {
  return BY_YEAR[year] || null
}

/** 팀별 우승 횟수 + 우승 연도 목록 (내림차순) */
export function titlesByTeam(team) {
  const years = CHAMPIONS.filter((c) => c.champ === team).map((c) => c.year)
  return { count: years.length, years }
}

/** 우승 횟수 순위표 [{team, count, years}] */
export function titleRanking() {
  const map = {}
  for (const c of CHAMPIONS) (map[c.champ] ??= []).push(c.year)
  return Object.entries(map)
    .map(([team, years]) => ({ team, count: years.length, years }))
    .sort((a, b) => b.count - a.count || b.years[0] - a.years[0])
}
