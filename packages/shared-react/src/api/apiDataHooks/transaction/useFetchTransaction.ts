import { isRichTransaction, selectSentTransactionByHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { UseFetchTransactionProps } from '@/api/apiDataHooks/transaction/transactionTypes'
import { useFetchPendingTransaction } from '@/api/apiDataHooks/transaction/useFetchPendingTransaction'
import { confirmedTransactionQuery } from '@/api/queries/transactionQueries'
import { useUnsortedAddressesHashes } from '@/hooks/addresses/useUnsortedAddresses'
import { useCurrentlyOnlineNetworkId } from '@/network'
import { useSharedSelector } from '@/redux'

export const useFetchTransaction = ({ txHash, skip }: UseFetchTransactionProps) => {
  const sentTx = useSharedSelector((s) => selectSentTransactionByHash(s, txHash))
  const networkId = useCurrentlyOnlineNetworkId()
  const addressHashes = useUnsortedAddressesHashes()

  const isPendingTx = sentTx && sentTx.status !== 'confirmed'

  const { data: confirmedTx, isLoading: isLoadingConfirmedTx } = useQuery(
    confirmedTransactionQuery({ txHash, addressHashes, networkId, skip: skip || isPendingTx })
  )
  const { data: pendingTx, isLoading: isLoadingPendingTx } = useFetchPendingTransaction({
    txHash,
    skip: skip || !isPendingTx
  })

  return {
    // Until we find an easy way to convert a RichTransaction to a Transaction, we need to return undefined for
    // RichTransactions which will disable the display of any transaction details component when the EB is down.
    data: confirmedTx ?? (pendingTx && !isRichTransaction(pendingTx) ? pendingTx : undefined),
    isLoading: isLoadingConfirmedTx || isLoadingPendingTx
  }
}
