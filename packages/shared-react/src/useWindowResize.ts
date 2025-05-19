import { useEffect } from 'react'

export const useWindowResize = (onResize: () => void) => {
  useEffect(() => {
    window.addEventListener('resize', onResize)

    return () => window.removeEventListener('resize', onResize)
  }, [onResize])
}
