import { RefObject, useEffect } from 'react'

interface UseOnClickOutsideProps<T> {
  ref: RefObject<T>
  handler: (e: MouseEvent) => void
}

const useOnClickOutside = <T extends HTMLElement | null>({ ref, handler }: UseOnClickOutsideProps<T>) => {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) {
        return
      }

      handler(e)
    }
    document.addEventListener('mousedown', listener)
    return () => {
      document.removeEventListener('mousedown', listener)
    }
  }, [ref, handler])
}

export default useOnClickOutside
