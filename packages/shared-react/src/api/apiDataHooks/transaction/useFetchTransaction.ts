import { selectSentTransactionByHash } from '@alephium/shared/store'
import { isConfirmedTx, isRichTransaction } from '@alephium/shared/transactions'
import { useQuery } from '@tanstack/react-query'

import { UseFetchTransactionProps } from '../../../api/apiDataHooks/transaction/transactionTypes'
import { useFetchPendingTransaction } from '../../../api/apiDataHooks/transaction/useFetchPendingTransaction'
import { confirmedTransactionQuery } from '../../../api/queries/transactionQueries'
import { useUnsortedAddressesHashes } from '../../../hooks/addresses/useUnsortedAddresses'
import { useIsExplorerOnline, useNetworkId } from '../../../network/networkHooks'
import { useSharedSelector } from '../../../redux'

export const useFetchTransaction = ({ txHash, skip }: UseFetchTransactionProps) => {
  const sentTx = useSharedSelector((s) => selectSentTransactionByHash(s, txHash))
  const networkId = useNetworkId()
  const isExplorerOnline = useIsExplorerOnline()
  const addressHashes = useUnsortedAddressesHashes()

  const isPendingTx = sentTx && sentTx.status !== 'confirmed'

  const { data: confirmedTx, isLoading: isLoadingConfirmedTx } = useQuery(
    confirmedTransactionQuery({ txHash, addressHashes, networkId, isExplorerOnline, skip: skip || isPendingTx })
  )
  const { data: pendingTx, isLoading: isLoadingPendingTx } = useFetchPendingTransaction({
    txHash,
    skip: skip || !isPendingTx
  })

  // Until we can convert RichTransaction to Transaction, node-only data cannot be shown in transaction details.
  const explorerPendingTx = pendingTx && !isRichTransaction(pendingTx) ? pendingTx : undefined

  return {
    // A disabled confirmed query can still expose cached pending data. Do not let it mask the sent transaction poll.
    data: confirmedTx && isConfirmedTx(confirmedTx) ? confirmedTx : explorerPendingTx ?? confirmedTx,
    isLoading: isLoadingConfirmedTx || isLoadingPendingTx
  }
}
