import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { DataProvider } from './lib/data.jsx'
import Standings from './pages/Standings.jsx'
import Hitters from './pages/Hitters.jsx'
import Pitchers from './pages/Pitchers.jsx'
import Player from './pages/Player.jsx'
import Team from './pages/Team.jsx'
import Compare from './pages/Compare.jsx'
import History from './pages/History.jsx'
import Glossary from './pages/Glossary.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <DataProvider>
        <Routes>
          <Route element={<App />}>
            <Route index element={<Standings />} />
            <Route path="hitters" element={<Hitters />} />
            <Route path="pitchers" element={<Pitchers />} />
            <Route path="player/:id" element={<Player />} />
            <Route path="team/:name" element={<Team />} />
            <Route path="compare" element={<Compare />} />
            <Route path="history" element={<History />} />
            <Route path="glossary" element={<Glossary />} />
          </Route>
        </Routes>
      </DataProvider>
    </HashRouter>
  </StrictMode>,
)
