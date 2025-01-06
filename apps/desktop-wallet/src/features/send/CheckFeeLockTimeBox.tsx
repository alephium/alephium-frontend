import { ALPH } from '@alephium/token-list'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Amount from '@/components/Amount'
import Box from '@/components/Box'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import InfoRow from '@/features/send/InfoRow'
import { formatDateForDisplay } from '@/utils/misc'

interface CheckFeeLockTimeBoxProps {
  fee: bigint
  lockTime?: Date
  className?: string
}

const CheckFeeLockTimeBox = ({ fee, lockTime, className }: CheckFeeLockTimeBoxProps) => {
  const { t } = useTranslation()

  return (
    <Box className={className}>
      <InfoRow label={t('Expected fee')}>
        <Amount tokenId={ALPH.id} value={fee} fullPrecision />
      </InfoRow>
      {lockTime && (
        <>
          <HorizontalDivider />
          <InfoRow label={t('Unlocks at')}>
            <UnlocksAt>
              {formatDateForDisplay(lockTime)}
              <FromNow>({dayjs(lockTime).fromNow()})</FromNow>
            </UnlocksAt>
          </InfoRow>
        </>
      )}
    </Box>
  )
}

export default CheckFeeLockTimeBox

const UnlocksAt = styled.div`
  display: flex;
  gap: var(--spacing-1);
`

const FromNow = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`
