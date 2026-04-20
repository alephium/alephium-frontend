import { formatRelativeTime } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Box from '@/components/Box'
import InfoRow from '@/features/send/InfoRow'
import { formatDateForDisplay } from '@/utils/misc'

interface CheckLockTimeBoxProps {
  lockTime: Date
  className?: string
}

const CheckLockTimeBox = ({ lockTime, className }: CheckLockTimeBoxProps) => {
  const { t, i18n } = useTranslation()

  return (
    <Box className={className}>
      <InfoRow label={t('Unlocks at')}>
        <UnlocksAt>
          {formatDateForDisplay(lockTime, i18n.language)}
          <FromNow>({formatRelativeTime(lockTime, i18n.language)})</FromNow>
        </UnlocksAt>
      </InfoRow>
    </Box>
  )
}

export default CheckLockTimeBox

const UnlocksAt = styled.div`
  display: flex;
  gap: var(--spacing-1);
`

const FromNow = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`
