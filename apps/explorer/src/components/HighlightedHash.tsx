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
  fontSize = 15,
  maxWidth = 'auto',
  className
}: HighlightedHashProps) => {
  const [baseHash, group] = text.split(':')

  return (
    <div style={{ fontSize, maxWidth, wordBreak: middleEllipsis ? 'initial' : 'break-all' }} className={className}>
      <HighlightedPart>{middleEllipsis ? <TextMiddleEllipsis text={baseHash} /> : baseHash}</HighlightedPart>
      {group && <GroupPart>:{group}</GroupPart>}

      {textToCopy && (
        <ButtonWrapper>
          <ClipboardButton textToCopy={textToCopy} />
        </ButtonWrapper>
      )}
    </div>
  )
}

export default styled(HighlightedHash)`
  display: flex;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
`

const HighlightedPart = styled.span`
  background: ${({ theme }) => theme.global.highlight};
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`

const GroupPart = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`

const ButtonWrapper = styled.div`
  flex-shrink: 0;
`
