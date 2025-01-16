import styled from 'styled-components'

import ClipboardButton from '../Buttons/ClipboardButton'
import Ellipsed from '../Ellipsed'

interface HighlightedCellProps {
  children: string
  textToCopy?: string
  className?: string
}

const HighlightedCell = ({ children, textToCopy, className }: HighlightedCellProps) => (
  <div className={className}>
    <Ellipsed text={children} />
    {textToCopy && <ClipboardButton textToCopy={textToCopy} />}
  </div>
)

export default styled(HighlightedCell)`
  display: flex;
  align-items: center;
  font-weight: 600 !important;
  color: ${({ theme }) => theme.global.highlight};
`
