import { selectSentTransactionByHash, sentTransactionStatusChanged } from '@alephium/shared/store'
import { findTransactionInternalAddresses, isConfirmedTx, isRichTransaction } from '@alephium/shared/transactions'
import { explorer as e } from '@alephium/web3'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useFetchPendingTransaction } from '../../api/apiDataHooks/transaction/useFetchPendingTransaction'
import { addressLatestTransactionQuery, nodeTransactionStatusQuery } from '../../api/queries/transactionQueries'
import { queryClient } from '../../api/queryClient'
import { invalidateAddressQueries, invalidateTokenPrices } from '../../api/queryInvalidation'
import { useUnsortedAddressesHashes } from '../../hooks/addresses/useUnsortedAddresses'
import { useIsExplorerOffline, useIsExplorerOnline, useIsNodeOnline, useNetworkId } from '../../network/networkHooks'
import { useSharedDispatch, useSharedSelector } from '../../redux'

export const usePendingTxPolling = (txHash: e.Transaction['hash']) => {
  const dispatch = useSharedDispatch()
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()
  const sentTx = useSharedSelector((s) => selectSentTransactionByHash(s, txHash))
  const allAddressHashes = useUnsortedAddressesHashes()
  const isExplorerOffline = useIsExplorerOffline()
  const isExplorerOnline = useIsExplorerOnline()

  const txIsConfirmed = !sentTx || sentTx.status === 'confirmed'

  const { data: tx } = useFetchPendingTransaction({ txHash, skip: txIsConfirmed })
  const { data: txStatus } = useQuery(
    nodeTransactionStatusQuery({ txHash, networkId, isNodeOnline, skip: txIsConfirmed || !isExplorerOffline })
  )

  // When EB is up, we use the EB to get the tx status
  useEffect(() => {
    if (!tx || isRichTransaction(tx)) return

    if (isConfirmedTx(tx)) {
      dispatch(sentTransactionStatusChanged({ hash: tx.hash, status: 'confirmed' }))

      findTransactionInternalAddresses(allAddressHashes, tx).forEach((addressHash) => {
        queryClient.refetchQueries({
          queryKey: addressLatestTransactionQuery({ addressHash, networkId, isExplorerOnline }).queryKey
        })
      })
    } else {
      dispatch(sentTransactionStatusChanged({ hash: tx.hash, status: 'mempooled' }))
    }
  }, [allAddressHashes, dispatch, isExplorerOnline, networkId, tx])

  // When EB is down, we use the node to get the tx status
  useEffect(() => {
    if (!isExplorerOffline) return

    if (txStatus === 'MemPooled') {
      dispatch(sentTransactionStatusChanged({ hash: txHash, status: 'mempooled' }))
    } else if (txStatus === 'Confirmed' && tx && isRichTransaction(tx)) {
      dispatch(sentTransactionStatusChanged({ hash: tx.unsigned.txId, status: 'confirmed' }))

      findTransactionInternalAddresses(allAddressHashes, tx).forEach(invalidateAddressQueries)
      invalidateTokenPrices()
    }
  }, [allAddressHashes, dispatch, isExplorerOffline, tx, txHash, txStatus])
}
