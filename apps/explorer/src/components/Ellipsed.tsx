import { HTMLAttributes, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

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

  useEffect(() => {
    handleResize()
  }, [handleResize, text])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  return (
    <div ref={el} key={text} className={className} data-tooltip-id="default" data-tooltip-content={text}>
      <HiddenText>{text}</HiddenText>
      <div>{_text}</div>
    </div>
  )
}

export default styled(Ellipsed)`
  overflow: hidden;
`

const HiddenText = styled.div`
  visibility: hidden;
  height: 0;
`
