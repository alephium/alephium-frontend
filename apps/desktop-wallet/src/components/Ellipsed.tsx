import { useMiddleEllipsedText } from '@alephium/shared-react'
import { HTMLAttributes } from 'react'
import styled from 'styled-components'

interface EllipsedProps extends HTMLAttributes<HTMLDivElement> {
  text: string
  className?: string
}

const Ellipsed = ({ text, className }: EllipsedProps) => {
  const { ellipsedText, ref } = useMiddleEllipsedText(text)

  return (
    <EllipsedStyled ref={ref} className={className}>
      <HiddenText>{text}</HiddenText>
      <div>{ellipsedText}</div>
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
