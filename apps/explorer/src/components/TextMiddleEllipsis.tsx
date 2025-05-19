import { useMiddleEllipsedText } from '@alephium/shared-react'
import { HTMLAttributes } from 'react'
import styled from 'styled-components'

interface TextMiddleEllipsisProps extends HTMLAttributes<HTMLDivElement> {
  text: string
  className?: string
}

const TextMiddleEllipsis = ({ text, className }: TextMiddleEllipsisProps) => {
  const { ellipsedText, ref } = useMiddleEllipsedText(text)

  return (
    <div ref={ref} className={className}>
      <HiddenText>{text}</HiddenText>
      <div>{ellipsedText}</div>
    </div>
  )
}

export default styled(TextMiddleEllipsis)`
  font-variant-numeric: tabular-nums;
  overflow: hidden;
`

const HiddenText = styled.div`
  visibility: hidden;
  height: 0;
`
