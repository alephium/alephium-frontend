import { formatRelativeTime } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface TimeSinceProps {
  timestamp: number
  faded?: boolean
  className?: string
}

const TimeSince = ({ timestamp, className }: TimeSinceProps) => {
  const { i18n } = useTranslation()

  return <div className={className}>{formatRelativeTime(timestamp, i18n.language)}</div>
}

export default styled(TimeSince)`
  ${({ faded, theme }) => (faded ? `color: ${theme.font.tertiary}` : '')};
  overflow: hidden;
  text-overflow: ellipsis;
`
