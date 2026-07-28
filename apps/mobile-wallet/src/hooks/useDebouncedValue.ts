import { useEffect, useState } from 'react'

// Returns a copy of `value` that only updates after `delayMs` has elapsed without further changes.
const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delayMs)

    return () => clearTimeout(timeout)
  }, [value, delayMs])

  return debouncedValue
}

export default useDebouncedValue
