import styled from 'styled-components'

import TransactionAmounts from '@/features/transactionsDisplay/transactionDetailsModal/TransactionAmounts'
import TransactionType from '@/features/transactionsDisplay/transactionDetailsModal/TransactionType'
import { TransactionSummaryProps } from '@/features/transactionsDisplay/transactionDisplayTypes'

const TransactionSummary = ({ tx, referenceAddress }: TransactionSummaryProps) => (
  <SummaryStyled>
    <SummaryContent>
      <TransactionType tx={tx} referenceAddress={referenceAddress} />
      <TransactionAmounts tx={tx} referenceAddress={referenceAddress} />
    </SummaryContent>
  </SummaryStyled>
)

export default TransactionSummary

const SummaryStyled = styled.div`
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-1);
  background-color: ${({ theme }) => theme.bg.secondary};
  margin: var(--spacing-2);
  border-radius: var(--radius-huge);
`

const SummaryContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: var(--radius-big);
`
