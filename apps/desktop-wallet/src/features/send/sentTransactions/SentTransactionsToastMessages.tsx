import { selectAllSentTransactions } from '@alephium/shared'
import styled from 'styled-components'

import SentTransactionToastBox from '@/features/send/sentTransactions/SentTransactionToastBox'
import { StackedToast, StackedToastsContainer } from '@/features/toastMessages/StackedToasts'
import { useAppSelector } from '@/hooks/redux'

const SentTransactionsToastMessages = () => {
  const sentTxs = useAppSelector(selectAllSentTransactions)

  if (sentTxs.length === 0) return null

  return (
    <StackedToastsContainer>
      {sentTxs.map((tx, index) => (
        <StackedToast key={tx.hash} index={sentTxs.length - index - 1}>
          <SentTransactionToastBoxStyled key={tx.hash} txHash={tx.hash} />
        </StackedToast>
      ))}
    </StackedToastsContainer>
  )
}

export default SentTransactionsToastMessages

const SentTransactionToastBoxStyled = styled(SentTransactionToastBox)`
  width: 100%;
`
