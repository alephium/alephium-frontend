import { useTransactionInfoType2 } from '@alephium/shared-react'
import { ArrowLeftRight, ArrowRight as ArrowRightIcon } from 'lucide-react'
import styled from 'styled-components'

import { TransactionRowSectionProps } from '@/features/transactionsDisplay/transactionRow/types'
import useTransactionIconLabel from '@/features/transactionsDisplay/useTransactionIconLabel'

const DirectionCell = ({ tx, referenceAddress, view }: TransactionRowSectionProps) => {
  const infoType = useTransactionInfoType2({ tx, referenceAddress: referenceAddress, view })
  const { connectingWord } = useTransactionIconLabel({ tx, referenceAddress, view })

  if (view === 'address') {
    return infoType === 'address-group-transfer' || infoType === 'address-self-transfer' ? null : (
      <CellDirection>
        <DirectionText>{connectingWord}</DirectionText>
      </CellDirection>
    )
  }

  if (infoType === 'bidirectional-transfer') {
    return (
      <CellDirection>
        <ArrowLeftRight size={15} strokeWidth={2} />
      </CellDirection>
    )
  }

  return (
    <CellDirection>
      <ArrowRightIcon size={15} strokeWidth={2} />
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
