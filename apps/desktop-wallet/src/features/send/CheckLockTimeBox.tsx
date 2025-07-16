import dayjs from 'dayjs'
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
  const { t } = useTranslation()

  return (
    <Box className={className}>
      <InfoRow label={t('Unlocks at')}>
        <UnlocksAt>
          {formatDateForDisplay(lockTime)}
          <FromNow>({dayjs(lockTime).fromNow()})</FromNow>
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
