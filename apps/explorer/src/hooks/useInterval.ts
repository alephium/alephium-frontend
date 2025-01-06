import { useEffect, useRef } from 'react'

const useInterval = (callback: () => void, delay: number, shouldPause = false) => {
  const savedCallback = useRef<() => void>(() => null)

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null && !shouldPause) {
      const id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay, shouldPause])
}

export default useInterval
