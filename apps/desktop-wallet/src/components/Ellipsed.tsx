import { HTMLAttributes } from 'react'
import styled from 'styled-components'

interface EllipsedProps extends HTMLAttributes<HTMLDivElement> {
  text: string
  className?: string
}

const Ellipsed = ({ text, className }: EllipsedProps) => {
  const needsEllipsis = text.length > 11
  const truncatedText = needsEllipsis ? text.substring(0, 4) + '...' + text.slice(-4) : text

  return (
    <EllipsedStyled className={className}>
      <HiddenText>{text}</HiddenText>
      <div>{truncatedText}</div>
    </EllipsedStyled>
  )
}

export default Ellipsed

const EllipsedStyled = styled.div`
  font-family: 'Roboto Mono';
  overflow: hidden;
`

const HiddenText = styled.div`
  visibility: hidden;
  height: 0;
`
