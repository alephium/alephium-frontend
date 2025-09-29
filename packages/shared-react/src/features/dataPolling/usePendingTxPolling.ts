import {
  findTransactionInternalAddresses,
  isConfirmedTx,
  isRichTransaction,
  selectSentTransactionByHash,
  sentTransactionStatusChanged
} from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useFetchPendingTransaction } from '@/api/apiDataHooks/transaction/useFetchPendingTransaction'
import { nodeTransactionStatusQuery } from '@/api/queries/transactionQueries'
import { queryClient } from '@/api/queryClient'
import { invalidateAddressQueries } from '@/api/queryInvalidation'
import { useUnsortedAddressesHashes } from '@/hooks/addresses/useUnsortedAddresses'
import { useCurrentlyOnlineNetworkId } from '@/network/useCurrentlyOnlineNetworkId'
import { useIsExplorerOffline } from '@/network/useIsServerOffline'
import { useSharedDispatch, useSharedSelector } from '@/redux'

export const usePendingTxPolling = (txHash: e.Transaction['hash']) => {
  const dispatch = useSharedDispatch()
  const networkId = useCurrentlyOnlineNetworkId()
  const sentTx = useSharedSelector((s) => selectSentTransactionByHash(s, txHash))
  const allAddressHashes = useUnsortedAddressesHashes()
  const isExplorerOffline = useIsExplorerOffline()

  const txIsConfirmed = !sentTx || sentTx.status === 'confirmed'

  const { data: tx } = useFetchPendingTransaction({ txHash, skip: txIsConfirmed })
  const { data: txStatus } = useQuery(
    nodeTransactionStatusQuery({ txHash, networkId, skip: txIsConfirmed || !isExplorerOffline })
  )

  // When EB is up, we use the EB to get the tx status
  useEffect(() => {
    if (!tx || isRichTransaction(tx)) return

    if (isConfirmedTx(tx)) {
      dispatch(sentTransactionStatusChanged({ hash: tx.hash, status: 'confirmed' }))

      findTransactionInternalAddresses(allAddressHashes, tx).forEach((addressHash) => {
        queryClient.refetchQueries({ queryKey: ['address', addressHash, 'transaction', 'latest', { networkId }] })
      })
    } else {
      dispatch(sentTransactionStatusChanged({ hash: tx.hash, status: 'mempooled' }))
    }
  }, [allAddressHashes, dispatch, networkId, tx])

  // When EB is down, we use the node to get the tx status
  useEffect(() => {
    if (!isExplorerOffline) return

    if (txStatus === 'MemPooled') {
      dispatch(sentTransactionStatusChanged({ hash: txHash, status: 'mempooled' }))
    } else if (txStatus === 'Confirmed' && tx && isRichTransaction(tx)) {
      dispatch(sentTransactionStatusChanged({ hash: tx.unsigned.txId, status: 'confirmed' }))

      findTransactionInternalAddresses(allAddressHashes, tx).forEach(invalidateAddressQueries)
    }
  }, [allAddressHashes, dispatch, isExplorerOffline, tx, txHash, txStatus])
}
