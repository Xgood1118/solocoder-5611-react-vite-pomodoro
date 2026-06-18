import { useRef } from 'react'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useTimerStore } from '../stores/useTimerStore'
import { useTaskStore } from '../stores/useTaskStore'
import './Settings.css'

export default function Settings() {
  const workDuration = useSettingsStore((s) => s.workDuration)
  const shortBreakDuration = useSettingsStore((s) => s.shortBreakDuration)
  const longBreakDuration = useSettingsStore((s) => s.longBreakDuration)
  const cyclesBeforeLongBreak = useSettingsStore((s) => s.cyclesBeforeLongBreak)
  const theme = useSettingsStore((s) => s.theme)
  const soundMode = useSettingsStore((s) => s.soundMode)
  const customSoundUrl = useSettingsStore((s) => s.customSoundUrl)
  const autoStartNext = useSettingsStore((s) => s.autoStartNext)
  const strictMode = useSettingsStore((s) => s.strictMode)
  const dailyGoal = useSettingsStore((s) => s.dailyGoal)
  const settings = {
    workDuration, shortBreakDuration, longBreakDuration,
    cyclesBeforeLongBreak, theme, soundMode, customSoundUrl,
    autoStartNext, strictMode, dailyGoal
  }
  const updateSetting = useSettingsStore((s) => s.updateSetting)
  const resetSettings = useSettingsStore((s) => s.resetSettings)
  const timerHistory = useTimerStore((s) => s.history)
  const totalPomodoros = useTimerStore((s) => s.totalPomodorosCompleted)
  const completedCycles = useTimerStore((s) => s.completedCycles)
  const taskList = useTaskStore((s) => s.tasks)

  const fileInputRef = useRef(null)

  const handleExport = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: {
        workDuration: settings.workDuration,
        shortBreakDuration: settings.shortBreakDuration,
        longBreakDuration: settings.longBreakDuration,
        cyclesBeforeLongBreak: settings.cyclesBeforeLongBreak,
        theme: settings.theme,
        soundMode: settings.soundMode,
        autoStartNext: settings.autoStartNext,
        strictMode: settings.strictMode,
        dailyGoal: settings.dailyGoal
      },
      tasks: taskList,
      timer: {
        totalPomodorosCompleted: totalPomodoros,
        completedCycles: completedCycles,
        history: timerHistory
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pomodoro-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.version !== 1) {
          alert('不支持的数据格式')
          return
        }
        if (data.settings) {
          Object.entries(data.settings).forEach(([key, value]) => {
            updateSetting(key, value)
          })
        }
        if (data.tasks) {
          useTaskStore.setState({ tasks: data.tasks })
        }
        if (data.timer) {
          useTimerStore.setState({
            totalPomodorosCompleted: data.timer.totalPomodorosCompleted || 0,
            completedCycles: data.timer.completedCycles || 0,
            history: data.timer.history || []
          })
        }
        alert('导入成功！')
      } catch {
        alert('导入失败：文件格式错误')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleReset = () => {
    if (window.confirm('确认重置所有设置为默认值？')) {
      resetSettings()
    }
  }

  return (
    <div className="settings-container">
      <h2>设置</h2>

      <section className="settings-section">
        <h3>⏱ 计时器</h3>
        <div className="settings-grid">
          <label className="setting-item">
            <span>工作时长（分钟）</span>
            <input
              className="input input-sm"
              type="number"
              min="1"
              max="120"
              value={settings.workDuration}
              onChange={(e) => updateSetting('workDuration', Number(e.target.value))}
            />
          </label>
          <label className="setting-item">
            <span>短休息（分钟）</span>
            <input
              className="input input-sm"
              type="number"
              min="1"
              max="60"
              value={settings.shortBreakDuration}
              onChange={(e) => updateSetting('shortBreakDuration', Number(e.target.value))}
            />
          </label>
          <label className="setting-item">
            <span>长休息（分钟）</span>
            <input
              className="input input-sm"
              type="number"
              min="1"
              max="60"
              value={settings.longBreakDuration}
              onChange={(e) => updateSetting('longBreakDuration', Number(e.target.value))}
            />
          </label>
          <label className="setting-item">
            <span>长休息前循环数</span>
            <input
              className="input input-sm"
              type="number"
              min="1"
              max="10"
              value={settings.cyclesBeforeLongBreak}
              onChange={(e) => updateSetting('cyclesBeforeLongBreak', Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="settings-section">
        <h3>🎨 外观</h3>
        <div className="settings-grid">
          <label className="setting-item">
            <span>主题</span>
            <select
              className="input input-sm"
              value={settings.theme}
              onChange={(e) => updateSetting('theme', e.target.value)}
            >
              <option value="system">跟随系统</option>
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </label>
        </div>
      </section>

      <section className="settings-section">
        <h3>🔊 声音与通知</h3>
        <div className="settings-grid">
          <label className="setting-item">
            <span>声音</span>
            <select
              className="input input-sm"
              value={settings.soundMode}
              onChange={(e) => updateSetting('soundMode', e.target.value)}
            >
              <option value="off">关闭</option>
              <option value="beep">提示音</option>
              <option value="custom">自定义</option>
            </select>
          </label>
          {settings.soundMode === 'custom' && (
            <label className="setting-item">
              <span>自定义音频 URL</span>
              <input
                className="input input-sm"
                type="url"
                placeholder="https://..."
                value={settings.customSoundUrl}
                onChange={(e) => updateSetting('customSoundUrl', e.target.value)}
              />
            </label>
          )}
        </div>
      </section>

      <section className="settings-section">
        <h3>⚙️ 行为</h3>
        <div className="settings-grid">
          <label className="setting-item setting-toggle">
            <span>自动开始下一阶段</span>
            <input
              type="checkbox"
              checked={settings.autoStartNext}
              onChange={(e) => updateSetting('autoStartNext', e.target.checked)}
            />
          </label>
          <label className="setting-item setting-toggle">
            <span>严格模式（工作阶段不可暂停）</span>
            <input
              type="checkbox"
              checked={settings.strictMode}
              onChange={(e) => updateSetting('strictMode', e.target.checked)}
            />
          </label>
          <label className="setting-item">
            <span>每日目标（🍅数）</span>
            <input
              className="input input-sm"
              type="number"
              min="1"
              max="30"
              value={settings.dailyGoal}
              onChange={(e) => updateSetting('dailyGoal', Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="settings-section">
        <h3>💾 数据</h3>
        <div className="settings-actions">
          <button className="btn btn-secondary" onClick={handleExport}>
            📤 导出数据
          </button>
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            📥 导入数据
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
          <button className="btn btn-ghost" onClick={handleReset}>
            🔄 重置设置
          </button>
        </div>
      </section>
    </div>
  )
}
