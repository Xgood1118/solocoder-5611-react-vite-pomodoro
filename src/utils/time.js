export function formatTime(totalSeconds) {
  const mins = Math.floor(Math.abs(totalSeconds) / 60)
  const secs = Math.abs(totalSeconds) % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function formatMinutes(totalSeconds) {
  return Math.ceil(totalSeconds / 60)
}

export function minutesToSeconds(minutes) {
  return minutes * 60
}

export function secondsToMinutes(seconds) {
  return seconds / 60
}
