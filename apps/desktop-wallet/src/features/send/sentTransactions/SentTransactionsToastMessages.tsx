import { selectAllSentTransactions } from '@/features/send/sentTransactions/sentTransactionsSelectors'
import SentTransactionToastBox from '@/features/send/sentTransactions/SentTransactionToastBox'
import { useAppSelector } from '@/hooks/redux'

const SentTransactionsToastMessages = () => {
  const sentTxs = useAppSelector(selectAllSentTransactions)

  if (sentTxs.length === 0) return null

  return sentTxs.map((tx) => <SentTransactionToastBox key={tx.hash} txHash={tx.hash} />)
}

export default SentTransactionsToastMessages
