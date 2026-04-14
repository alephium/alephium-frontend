import { formatRelativeTime } from '@alephium/shared'
import styled from 'styled-components'

interface TimeSinceProps {
  timestamp: number
  faded?: boolean
  className?: string
}

const TimeSince = ({ timestamp, className }: TimeSinceProps) => (
  <div className={className}>{formatRelativeTime(timestamp)}</div>
)

export default styled(TimeSince)`
  ${({ faded, theme }) => (faded ? `color: ${theme.font.tertiary}` : '')};
  overflow: hidden;
  text-overflow: ellipsis;
`
