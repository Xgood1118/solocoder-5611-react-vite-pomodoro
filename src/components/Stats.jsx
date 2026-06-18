import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts'
import { useTimerStore } from '../stores/useTimerStore'
import { useTaskStore } from '../stores/useTaskStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { getDateRange, formatDateLabel, getTodayKey } from '../utils/date'
import { formatPercent } from '../utils/format'
import './Stats.css'

const PIE_COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

export default function Stats() {
  const history = useTimerStore((s) => s.history)
  const totalPomodorosCompleted = useTimerStore((s) => s.totalPomodorosCompleted)
  const tasks = useTaskStore((s) => s.tasks)
  const dailyGoal = useSettingsStore((s) => s.dailyGoal)

  const todayKey = getTodayKey()
  const todayPomodoros = useMemo(() => {
    const entry = history.find((h) => h.date === todayKey)
    return entry ? entry.pomodoros : 0
  }, [history, todayKey])

  const trendData = useMemo(() => {
    const range = getDateRange(30)
    const map = new Map(history.map((h) => [h.date, h.pomodoros]))
    return range.map((d) => ({
      date: formatDateLabel(d),
      pomodoros: map.get(d) || 0
    }))
  }, [history])

  const projectData = useMemo(() => {
    const projectMap = {}
    tasks.forEach((t) => {
      const key = t.project || '未分类'
      projectMap[key] = (projectMap[key] || 0) + t.completedPomodoros
    })
    return Object.entries(projectMap)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }))
  }, [tasks])

  const completionRate = useMemo(() => {
    const total = tasks.reduce((sum, t) => sum + t.estimatedPomodoros, 0)
    const completed = tasks.reduce((sum, t) => sum + t.completedPomodoros, 0)
    return formatPercent(completed, total)
  }, [tasks])

  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      count: 0
    }))
    history.forEach((day) => {
      if (day.hourly) {
        Object.entries(day.hourly).forEach(([h, count]) => {
          hours[Number(h)].count += count
        })
      }
    })
    return hours
  }, [history])

  return (
    <div className="stats-container">
      <h2>统计</h2>

      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-value">{todayPomodoros}</div>
          <div className="stat-label">今日🍅</div>
          <div className="stat-goal">
            目标 {dailyGoal} · {todayPomodoros >= dailyGoal ? '✓ 已达成' : `还差 ${dailyGoal - todayPomodoros}`}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalPomodorosCompleted}</div>
          <div className="stat-label">累计🍅</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completionRate}</div>
          <div className="stat-label">完成率</div>
        </div>
      </div>

      <div className="stats-chart-section">
        <h3>每日趋势（近 30 天）</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--text-tertiary)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--text-tertiary)" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8
                }}
              />
              <Line
                type="monotone"
                dataKey="pomodoros"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {projectData.length > 0 && (
        <div className="stats-chart-section">
          <h3>项目分布</h3>
          <div className="chart-wrapper chart-pie">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {projectData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="stats-chart-section">
        <h3>最专注时段</h3>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10 }}
                stroke="var(--text-tertiary)"
                interval={2}
              />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--text-tertiary)" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8
                }}
              />
              <Bar dataKey="count" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
