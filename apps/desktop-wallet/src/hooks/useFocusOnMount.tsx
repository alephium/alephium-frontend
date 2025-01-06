import { useEffect, useRef } from 'react'

export default function <T extends HTMLElement>(skipFocusOnMount?: boolean) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (skipFocusOnMount) return

    const timer = setTimeout(() => ref.current?.focus(), 0)

    return () => clearTimeout(timer)
  }, [ref, skipFocusOnMount])

  return ref
}
