import styled from 'styled-components'

import TransactionAmounts from '@/features/transactionsDisplay/transactionDetailsModal/TransactionAmounts'
import TransactionType from '@/features/transactionsDisplay/transactionDetailsModal/TransactionType'
import { TransactionDisplayProps } from '@/features/transactionsDisplay/transactionDisplayTypes'

interface TransactionSummaryProps extends TransactionDisplayProps {
  hideType?: boolean
  className?: string
  skipCaching?: boolean
}

const TransactionSummary = ({ tx, referenceAddress, hideType, className, skipCaching }: TransactionSummaryProps) => (
  <SummaryStyled className={className}>
    <SummaryContent>
      {!hideType && <TransactionType tx={tx} referenceAddress={referenceAddress} />}
      <TransactionAmounts tx={tx} referenceAddress={referenceAddress} skipCaching={skipCaching} />
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
