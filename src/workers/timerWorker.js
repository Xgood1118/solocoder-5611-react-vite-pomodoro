let timerInterval = null
let endTime = null
let remainingOnPause = null

self.onmessage = function (e) {
  const { type, duration, remaining } = e.data

  switch (type) {
    case 'start':
      clearInterval(timerInterval)
      endTime = Date.now() + duration * 1000
      runTick()
      break

    case 'resume':
      clearInterval(timerInterval)
      endTime = Date.now() + remaining * 1000
      runTick()
      break

    case 'pause':
      clearInterval(timerInterval)
      remainingOnPause = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
      timerInterval = null
      break

    case 'stop':
      clearInterval(timerInterval)
      timerInterval = null
      endTime = null
      remainingOnPause = null
      break

    default:
      break
  }
}

function runTick() {
  timerInterval = setInterval(() => {
    const now = Date.now()
    const remaining = Math.max(0, Math.ceil((endTime - now) / 1000))

    self.postMessage({ type: 'tick', remaining })

    if (remaining <= 0) {
      clearInterval(timerInterval)
      timerInterval = null
      endTime = null
      remainingOnPause = null
      self.postMessage({ type: 'complete' })
    }
  }, 250)
}
