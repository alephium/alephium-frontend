import { useCallback, useEffect, useRef, useState } from 'react'

import { useWindowResize } from '@/useWindowResize'

export const useMiddleEllipsedText = (text: string) => {
  const elementRef = useRef<HTMLDivElement | null>(null)
  const [ellipsedText, setEllipsedText] = useState(text)

  const handleResize = useCallback(() => {
    if (elementRef?.current === null) {
      setEllipsedText(text.substring(0, 5) + '...')
    } else {
      const visibleChars = Math.floor(elementRef.current.clientWidth / (elementRef.current.scrollWidth / text.length))
      const half = visibleChars / 2

      setEllipsedText(
        visibleChars >= text.length
          ? text
          : text.slice(0, Math.floor(half) - 2) +
              (visibleChars === text.length ? '' : '...') +
              text.slice(-Math.ceil(half) + 2)
      )
    }
  }, [text])

  useWindowResize(handleResize)

  useEffect(() => {
    handleResize()
  }, [handleResize, text])

  return { ellipsedText, ref: elementRef }
}
