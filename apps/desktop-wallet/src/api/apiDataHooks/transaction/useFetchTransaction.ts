import { useQuery } from '@tanstack/react-query'

import { UseFetchTransactionProps } from '@/api/apiDataHooks/transaction/transactionTypes'
import useFetchPendingTransaction from '@/api/apiDataHooks/transaction/useFetchPendingTransaction'
import { confirmedTransactionQuery } from '@/api/queries/transactionQueries'
import { selectSentTransactionByHash } from '@/features/send/sentTransactions/sentTransactionsSelectors'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

const useFetchTransaction = ({ txHash, skip }: UseFetchTransactionProps) => {
  const sentTx = useAppSelector((s) => selectSentTransactionByHash(s, txHash))
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)

  const isPendingTx = sentTx && sentTx.status !== 'confirmed'

  const { data: confirmedTx, isLoading: isLoadingConfirmedTx } = useQuery(
    confirmedTransactionQuery({ txHash, networkId, skip: skip || isPendingTx })
  )
  const { data: pendingTx } = useFetchPendingTransaction({ txHash, skip: skip || !isPendingTx })

  return {
    data: confirmedTx ?? pendingTx,
    isLoading: isLoadingConfirmedTx
  }
}

export default useFetchTransaction
