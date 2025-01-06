import styled from 'styled-components'

import Badge from '@/components/Badge'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import useTransactionIconLabel from '@/features/transactionsDisplay/useTransactionIconLabel'

const TransactionType = ({ tx, refAddressHash }: TransactionDetailsModalTxProps) => {
  const { label, Icon, iconColor } = useTransactionIconLabel(tx, refAddressHash)

  return (
    <TransactionTypeStyled short color={iconColor}>
      <Icon size={14} color={iconColor} />
      {label}
    </TransactionTypeStyled>
  )
}

export default TransactionType

const TransactionTypeStyled = styled(Badge)`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-4);
`
