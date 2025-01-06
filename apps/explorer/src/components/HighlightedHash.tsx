import styled from 'styled-components'

import ClipboardButton from './Buttons/ClipboardButton'
import TextMiddleEllipsis from './TextMiddleEllipsis'

interface HighlightedHashProps {
  text: string
  textToCopy?: string
  middleEllipsis?: boolean
  fontSize?: number
  maxWidth?: string
  className?: string
}

const HighlightedHash = ({
  text,
  textToCopy,
  middleEllipsis = false,
  fontSize = 14,
  maxWidth = 'auto',
  className
}: HighlightedHashProps) => (
  <div style={{ fontSize, maxWidth, wordBreak: middleEllipsis ? 'initial' : 'break-all' }} className={className}>
    {middleEllipsis ? <TextMiddleEllipsis text={text} /> : text}
    {textToCopy && (
      <ButtonWrapper>
        <ClipboardButton textToCopy={textToCopy} />
      </ButtonWrapper>
    )}
  </div>
)

export default styled(HighlightedHash)`
  display: flex;
  background: ${({ theme }) => theme.global.highlight};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
`

const ButtonWrapper = styled.div`
  flex-shrink: 0;
`
