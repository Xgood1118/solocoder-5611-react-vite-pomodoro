import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_SETTINGS = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  cyclesBeforeLongBreak: 4,
  theme: 'system',
  soundMode: 'beep',
  customSoundUrl: '',
  autoStartNext: false,
  strictMode: false,
  dailyGoal: 8
}

export const useSettingsStore = create(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSetting: (key, value) => set({ [key]: value }),

      resetSettings: () => set(DEFAULT_SETTINGS)
    }),
    {
      name: 'pomodoro-settings'
    }
  )
)
