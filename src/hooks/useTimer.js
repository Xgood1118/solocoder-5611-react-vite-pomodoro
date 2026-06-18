import { useCallback, useEffect, useRef } from 'react'
import { useTimerStore } from '../stores/useTimerStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { useTaskStore } from '../stores/useTaskStore'
import { useWorker } from './useWorker'
import { useNotification } from './useNotification'
import { minutesToSeconds } from '../utils/time'
import { formatTime } from '../utils/time'

export function useTimer() {
  const phase = useTimerStore((s) => s.phase)
  const status = useTimerStore((s) => s.status)
  const remainingSeconds = useTimerStore((s) => s.remainingSeconds)
  const completedCycles = useTimerStore((s) => s.completedCycles)
  const totalPomodorosCompleted = useTimerStore((s) => s.totalPomodorosCompleted)
  const startWork = useTimerStore((s) => s.startWork)
  const startBreak = useTimerStore((s) => s.startBreak)
  const pauseStore = useTimerStore((s) => s.pause)
  const resumeStore = useTimerStore((s) => s.resume)
  const completePhase = useTimerStore((s) => s.completePhase)
  const resetCycle = useTimerStore((s) => s.resetCycle)
  const resetStore = useTimerStore((s) => s.reset)
  const setRemaining = useTimerStore((s) => s.setRemaining)

  const workDuration = useSettingsStore((s) => s.workDuration)
  const shortBreakDuration = useSettingsStore((s) => s.shortBreakDuration)
  const longBreakDuration = useSettingsStore((s) => s.longBreakDuration)
  const cyclesBeforeLongBreak = useSettingsStore((s) => s.cyclesBeforeLongBreak)
  const autoStartNext = useSettingsStore((s) => s.autoStartNext)
  const strictMode = useSettingsStore((s) => s.strictMode)

  const incrementPomodoro = useTaskStore((s) => s.incrementPomodoro)
  const completeTask = useTaskStore((s) => s.completeTask)
  const getActiveTask = useTaskStore((s) => s.getActiveTask)
  const { requestPermission, notify } = useNotification()

  const autoStartRef = useRef(autoStartNext)
  autoStartRef.current = autoStartNext

  const handleWorkerMessage = useCallback((data) => {
    if (data.type === 'tick') {
      if (useTimerStore.getState().status !== 'running') return
      setRemaining(data.remaining)
      document.title = `${formatTime(data.remaining)} - Pomodoro`
    } else if (data.type === 'complete') {
      handlePhaseComplete()
    }
  }, [])

  const { postMessage } = useWorker(handleWorkerMessage)

  useEffect(() => {
    requestPermission()
  }, [])

  const getPhaseDuration = useCallback((p) => {
    switch (p) {
      case 'work': return minutesToSeconds(workDuration)
      case 'shortBreak': return minutesToSeconds(shortBreakDuration)
      case 'longBreak': return minutesToSeconds(longBreakDuration)
      default: return minutesToSeconds(workDuration)
    }
  }, [workDuration, shortBreakDuration, longBreakDuration])

  const handlePhaseComplete = useCallback(() => {
    const currentPhase = useTimerStore.getState().phase
    const currentCycles = useTimerStore.getState().completedCycles

    if (currentPhase === 'work') {
      const newCycles = completePhase()

      const activeTask = useTaskStore.getState().tasks.find(
        (t) => t.status === 'inProgress' && !t.archived
      )
      if (activeTask) {
        incrementPomodoro(activeTask.id)
      }

      notify('🍅 工作完成！', '休息一下吧')

      const isLongBreak = newCycles >= cyclesBeforeLongBreak
      if (isLongBreak) {
        resetCycle()
      }

      if (autoStartRef.current) {
        const breakDuration = isLongBreak
          ? minutesToSeconds(longBreakDuration)
          : minutesToSeconds(shortBreakDuration)
        startBreak(isLongBreak)
        setRemaining(breakDuration)
        postMessage({ type: 'start', duration: breakDuration })
      } else {
        startBreak(isLongBreak)
        const breakDuration = isLongBreak
          ? minutesToSeconds(longBreakDuration)
          : minutesToSeconds(shortBreakDuration)
        setRemaining(breakDuration)
        document.title = `${formatTime(breakDuration)} - Pomodoro`
        useTimerStore.setState({ status: 'idle' })
      }
    } else {
      notify('☕ 休息结束！', '继续工作吧')
      if (autoStartRef.current) {
        const workSec = minutesToSeconds(workDuration)
        startWork()
        setRemaining(workSec)
        postMessage({ type: 'start', duration: workSec })
      } else {
        const workSec = minutesToSeconds(workDuration)
        startWork()
        setRemaining(workSec)
        document.title = `${formatTime(workSec)} - Pomodoro`
        useTimerStore.setState({ status: 'idle' })
      }
    }
  }, [cyclesBeforeLongBreak, workDuration, shortBreakDuration, longBreakDuration])

  const start = useCallback(() => {
    const duration = minutesToSeconds(workDuration)
    startWork()
    setRemaining(duration)
    postMessage({ type: 'start', duration })
  }, [workDuration])

  const pause = useCallback(() => {
    if (strictMode && phase === 'work') return
    pauseStore()
    postMessage({ type: 'pause' })
  }, [strictMode, phase])

  const resume = useCallback(() => {
    resumeStore()
    postMessage({ type: 'resume', remaining: remainingSeconds })
  }, [remainingSeconds])

  const skip = useCallback(() => {
    postMessage({ type: 'stop' })
    handlePhaseComplete()
  }, [handlePhaseComplete])

  const reset = useCallback(() => {
    postMessage({ type: 'stop' })
    resetStore()
    document.title = 'Pomodoro'
  }, [])

  const togglePause = useCallback(() => {
    if (status === 'running') {
      pause()
    } else if (status === 'paused') {
      resume()
    } else if (status === 'idle') {
      if (phase === 'idle') {
        start()
      } else {
        const duration = getPhaseDuration(phase)
        setRemaining(duration)
        resumeStore()
        postMessage({ type: 'start', duration })
      }
    }
  }, [status, phase, pause, resume, start, getPhaseDuration])

  const displaySeconds = (() => {
    if (phase === 'idle') return minutesToSeconds(workDuration)
    return remainingSeconds
  })()

  const progress = (() => {
    if (phase === 'idle') return 0
    const total = getPhaseDuration(phase)
    if (total === 0) return 1
    return 1 - remainingSeconds / total
  })()

  return {
    phase, status, remainingSeconds, displaySeconds, completedCycles,
    totalPomodorosCompleted, progress,
    start, pause, resume, skip, reset, togglePause,
    getPhaseDuration
  }
}
