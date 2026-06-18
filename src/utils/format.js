export function formatPercent(numerator, denominator) {
  if (denominator === 0) return '0%'
  return `${Math.round((numerator / denominator) * 100)}%`
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
