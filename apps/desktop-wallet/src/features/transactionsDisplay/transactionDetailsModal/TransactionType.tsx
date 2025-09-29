import styled from 'styled-components'

import { TransactionDisplayProps } from '@/features/transactionsDisplay/transactionDisplayTypes'
import useTransactionIconLabel from '@/features/transactionsDisplay/useTransactionIconLabel'

const TransactionType = ({ tx, referenceAddress }: TransactionDisplayProps) => {
  const { label, Icon, iconColor } = useTransactionIconLabel({ tx, referenceAddress, view: 'wallet' })

  return (
    <TransactionTypeStyled color={iconColor}>
      <Icon size={14} color={iconColor} />
      {label}
    </TransactionTypeStyled>
  )
}

export default TransactionType

const TransactionTypeStyled = styled.div<{ color: string }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-2);
  color: ${({ color }) => color};
  font-size: 14px;
`
