import { useState, useEffect, useCallback } from 'react'
import { useSettingsStore } from './stores/useSettingsStore'
import { useTimer } from './hooks/useTimer'
import Timer from './components/Timer'
import TaskList from './components/TaskList'
import Stats from './components/Stats'
import Settings from './components/Settings'
import './App.css'

const TABS = [
  { key: 'timer', label: '⏱ 计时', icon: '⏱' },
  { key: 'tasks', label: '📋 任务', icon: '📋' },
  { key: 'stats', label: '📊 统计', icon: '📊' },
  { key: 'settings', label: '⚙ 设置', icon: '⚙' }
]

export default function App() {
  const [activeTab, setActiveTab] = useState('timer')
  const theme = useSettingsStore((s) => s.theme)
  const strictMode = useSettingsStore((s) => s.strictMode)
  const { togglePause, skip, reset } = useTimer()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.setAttribute('data-theme', isDark ? 'dark' : 'light')

      const handler = (e) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light')
      }
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  const handleKeyDown = useCallback((e) => {
    const tag = e.target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

    switch (e.key) {
      case ' ':
        e.preventDefault()
        togglePause()
        break
      case 'r':
      case 'R':
        reset()
        break
      case 'n':
      case 'N':
        skip()
        break
      case 'Escape':
        reset()
        break
      default:
        break
    }
  }, [togglePause, skip, reset])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const renderContent = () => {
    switch (activeTab) {
      case 'timer': return <Timer />
      case 'tasks': return <TaskList />
      case 'stats': return <Stats />
      case 'settings': return <Settings />
      default: return <Timer />
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">🍅 Pomodoro</h1>
      </header>

      <main className="app-main">
        {renderContent()}
      </main>

      <nav className="app-nav">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`nav-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
