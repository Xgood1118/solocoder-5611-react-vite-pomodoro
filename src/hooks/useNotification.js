import { useCallback, useRef } from 'react'
import { useSettingsStore } from '../stores/useSettingsStore'

let audioContext = null

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioContext
}

function playBeep() {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.5)

    setTimeout(() => {
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.frequency.value = 1000
      osc2.type = 'sine'
      gain2.gain.setValueAtTime(0.3, ctx.currentTime)
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8)
      osc2.start(ctx.currentTime)
      osc2.stop(ctx.currentTime + 0.8)
    }, 300)
  } catch {
    // Audio not available
  }
}

function playCustom(url) {
  try {
    const audio = new Audio(url)
    audio.play().catch(() => {})
  } catch {
    // Audio not available
  }
}

export function useNotification() {
  const soundMode = useSettingsStore((s) => s.soundMode)
  const customSoundUrl = useSettingsStore((s) => s.customSoundUrl)

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  const notify = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '🍅' })
    }

    if (soundMode === 'beep') {
      playBeep()
    } else if (soundMode === 'custom' && customSoundUrl) {
      playCustom(customSoundUrl)
    }
  }, [soundMode, customSoundUrl])

  const playSound = useCallback(() => {
    if (soundMode === 'beep') {
      playBeep()
    } else if (soundMode === 'custom' && customSoundUrl) {
      playCustom(customSoundUrl)
    }
  }, [soundMode, customSoundUrl])

  return { requestPermission, notify, playSound }
}
