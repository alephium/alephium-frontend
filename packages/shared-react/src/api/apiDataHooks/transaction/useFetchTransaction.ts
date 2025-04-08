import { selectSentTransactionByHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { UseFetchTransactionProps } from '@/api/apiDataHooks/transaction/transactionTypes'
import { useFetchPendingTransaction } from '@/api/apiDataHooks/transaction/useFetchPendingTransaction'
import { confirmedTransactionQuery } from '@/api/queries/transactionQueries'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
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
  const { data: pendingTx } = useFetchPendingTransaction({ txHash, skip: skip || !isPendingTx })

  return {
    data: confirmedTx ?? pendingTx,
    isLoading: isLoadingConfirmedTx
  }
}
