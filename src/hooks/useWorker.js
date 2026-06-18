import { useRef, useEffect, useCallback } from 'react'

export function useWorker(onMessage) {
  const workerRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  onMessageRef.current = onMessage

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/timerWorker.js', import.meta.url),
      { type: 'module' }
    )

    workerRef.current.onmessage = (e) => {
      onMessageRef.current(e.data)
    }

    return () => {
      workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  const postMessage = useCallback((data) => {
    workerRef.current?.postMessage(data)
  }, [])

  return { postMessage }
}
