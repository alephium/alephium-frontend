import { useTransactionDirection, useTransactionInfoType2 } from '@alephium/shared-react'
import { ArrowLeftRight, ArrowRight as ArrowRightIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import HiddenLabel from '@/components/HiddenLabel'
import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'

const DirectionCell = ({ tx, referenceAddress, view }: TransactionRowSectionProps) => {
  const { t } = useTranslation()
  const direction = useTransactionDirection(tx, referenceAddress)
  const infoType = useTransactionInfoType2({ tx, referenceAddress: referenceAddress, view })

  if ((infoType === 'address-group-transfer' || infoType === 'address-self-transfer') && view === 'address') return null

  return (
    <CellDirection>
      <HiddenLabel text={direction === 'swap' ? t('and') : t('to')} />

      {view === 'address' ? (
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
