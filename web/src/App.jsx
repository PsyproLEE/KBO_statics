import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useData } from './lib/data.jsx'

const MENU = [
  { to: '/', label: '팀 순위', end: true },
  { to: '/hitters', label: '타자 기록' },
  { to: '/pitchers', label: '투수 기록' },
  { to: '/compare', label: '선수 비교' },
  { to: '/history', label: '역대 우승' },
  { to: '/glossary', label: '용어 가이드' },
]

export default function App() {
  const { meta } = useData()
  const { pathname } = useLocation()
  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
            KBO 스탯 센터
            <small>{meta.season} 시즌</small>
          </NavLink>
          <nav className="mainnav">
            {MENU.map((m) => (
              <NavLink key={m.to} to={m.to} end={m.end}>
                {m.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            title={theme === 'dark' ? '라이트 모드로' : '다크 모드로'}
            aria-label="테마 전환"
          >
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </header>
      <main className="shell">
        <Outlet />
        <footer className="footer">
          데이터 출처:{' '}
          <a href="https://www.koreabaseball.com" target="_blank" rel="noreferrer">
            KBO 공식 홈페이지
          </a>{' '}
          · 마지막 업데이트 {meta.updatedAt} (KST)
          <br />
          데이터 갱신: 터미널에서 <code>py scraper/scrape_kbo.py</code> 실행 후 새로고침
        </footer>
      </main>
    </>
  )
}
