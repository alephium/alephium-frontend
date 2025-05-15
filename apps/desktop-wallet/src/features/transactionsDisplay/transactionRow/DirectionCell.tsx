import { useTransactionDirection } from '@alephium/shared-react'
import { ArrowLeftRight, ArrowRight as ArrowRightIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import HiddenLabel from '@/components/HiddenLabel'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'

const DirectionCell = ({ tx, refAddressHash, isInAddressDetailsModal }: TransactionRowSectionProps) => {
  const { t } = useTranslation()
  const direction = useTransactionDirection(tx, refAddressHash)

  return (
    <CellDirection>
      <HiddenLabel text={direction === 'swap' ? t('and') : t('to')} />

      {isInAddressDetailsModal ? (
        <DirectionText>
          {
            {
              in: t('from'),
              out: t('to'),
              swap: t('with')
            }[direction]
          }
        </DirectionText>
      ) : direction === 'swap' ? (
        <ArrowLeftRight size={15} strokeWidth={2} />
      ) : (
        <ArrowRightIcon size={15} strokeWidth={2} />
      )}
    </CellDirection>
  )
}

export default DirectionCell

const CellDirection = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  border: 0;
`

const DirectionText = styled.div`
  min-width: 50px;
  display: flex;
  font-weight: var(--fontWeight-semiBold);
`
