import { useTimer } from '../hooks/useTimer'
import { formatTime } from '../utils/time'
import { useTaskStore } from '../stores/useTaskStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import './Timer.css'

const PHASE_LABELS = {
  idle: '准备开始',
  work: '专注工作',
  shortBreak: '短休息',
  longBreak: '长休息'
}

export default function Timer() {
  const {
    phase, status, displaySeconds, completedCycles, progress,
    start, pause, resume, skip, reset, togglePause
  } = useTimer()

  const tasks = useTaskStore((s) => s.tasks)
  const activeTask = tasks.find((t) => t.status === 'inProgress' && !t.archived)
  const cyclesBeforeLongBreak = useSettingsStore((s) => s.cyclesBeforeLongBreak)

  const radius = 120
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)
  const size = 280

  return (
    <div className="timer-container">
      <div className="timer-phase">{PHASE_LABELS[phase]}</div>

      <div className="timer-circle-wrapper">
        <svg width={size} height={size} className="timer-svg">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--timer-bg)"
            strokeWidth="8"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--timer-progress)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="timer-progress-ring"
          />
        </svg>
        <div className="timer-display">
          <span className="timer-time">{formatTime(displaySeconds)}</span>
        </div>
      </div>

      {activeTask && (
        <div className="timer-active-task">
          🎯 {activeTask.title}
          <span className="timer-task-pomodoros">
            {activeTask.completedPomodoros}/{activeTask.estimatedPomodoros}
          </span>
        </div>
      )}

      <div className="timer-cycles">
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className={`cycle-dot ${i < (completedCycles % 4) ? 'completed' : ''}`}
          />
        ))}
      </div>

      <div className="timer-controls">
        {phase === 'idle' && status === 'idle' ? (
          <button className="btn btn-primary btn-lg" onClick={start}>
            ▶ 开始专注
          </button>
        ) : (
          <>
            {status === 'running' && (
              <button className="btn btn-secondary" onClick={pause}>
                ⏸ 暂停
              </button>
            )}
            {status === 'paused' && (
              <button className="btn btn-primary" onClick={resume}>
                ▶ 继续
              </button>
            )}
            {(status === 'running' || status === 'paused') && (
              <>
                <button className="btn btn-secondary" onClick={skip}>
                  ⏭ 跳过
                </button>
                <button className="btn btn-ghost" onClick={reset}>
                  ⏹ 重置
                </button>
              </>
            )}
            {status === 'idle' && phase !== 'idle' && (
              <button className="btn btn-primary" onClick={togglePause}>
                ▶ 开始
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
