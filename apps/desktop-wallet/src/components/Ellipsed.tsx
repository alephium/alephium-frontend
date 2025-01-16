import { HTMLAttributes, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { useWindowResize } from '@/utils/hooks'

interface EllipsedProps extends HTMLAttributes<HTMLDivElement> {
  text: string
  className?: string
}

const Ellipsed = ({ text, className }: EllipsedProps) => {
  const el = useRef<HTMLDivElement | null>(null)
  const [_text, setText] = useState(text)

  const handleResize = useCallback(() => {
    if (el?.current === null) {
      setText(text.substring(0, 5) + '...')
    } else {
      const visibleChars = Math.floor(el.current.clientWidth / (el.current.scrollWidth / text.length))
      const half = visibleChars / 2

      setText(
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

  return (
    <div ref={el} className={className}>
      <HiddenText>{text}</HiddenText>
      <div>{_text}</div>
    </div>
  )
}

export default styled(Ellipsed)`
  font-family: 'Roboto Mono';
  overflow: hidden;
`

const HiddenText = styled.div`
  visibility: hidden;
  height: 0;
`
