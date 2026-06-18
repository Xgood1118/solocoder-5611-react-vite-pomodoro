import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getTodayKey } from '../utils/date'

export const useTimerStore = create(
  persist(
    (set, get) => ({
      phase: 'idle',
      status: 'idle',
      remainingSeconds: 0,
      completedCycles: 0,
      totalPomodorosCompleted: 0,
      currentCycleStartTime: null,
      history: [],

      setPhase: (phase) => set({ phase }),
      setStatus: (status) => set({ status }),
      setRemaining: (remainingSeconds) => set({ remainingSeconds }),

      startWork: () => set({
        phase: 'work',
        status: 'running',
        currentCycleStartTime: Date.now()
      }),

      startBreak: (isLong) => set({
        phase: isLong ? 'longBreak' : 'shortBreak',
        status: 'running'
      }),

      pause: () => set({ status: 'paused' }),
      resume: () => set({ status: 'running' }),

      completePhase: () => {
        const state = get()
        if (state.phase === 'work') {
          const newCycles = state.completedCycles + 1
          const newTotal = state.totalPomodorosCompleted + 1
          const now = new Date()
          const todayKey = getTodayKey()
          const hour = now.getHours()
          const history = [...state.history]
          const todayEntry = history.find((h) => h.date === todayKey)
          if (todayEntry) {
            todayEntry.pomodoros += 1
            todayEntry.hourly[hour] = (todayEntry.hourly[hour] || 0) + 1
          } else {
            history.push({ date: todayKey, pomodoros: 1, hourly: { [hour]: 1 } })
          }
          set({
            completedCycles: newCycles,
            totalPomodorosCompleted: newTotal,
            history
          })
          return newCycles
        }
        return state.completedCycles
      },

      resetCycle: () => set({ completedCycles: 0 }),

      reset: () => set({
        phase: 'idle',
        status: 'idle',
        remainingSeconds: 0,
        currentCycleStartTime: null
      }),

      getTodayPomodoros: () => {
        const todayKey = getTodayKey()
        const entry = get().history.find((h) => h.date === todayKey)
        return entry ? entry.pomodoros : 0
      }
    }),
    {
      name: 'pomodoro-timer',
      partialize: (state) => ({
        completedCycles: state.completedCycles,
        totalPomodorosCompleted: state.totalPomodorosCompleted,
        history: state.history
      })
    }
  )
)
