import {
  findTransactionInternalAddresses,
  isConfirmedTx,
  selectSentTransactionByHash,
  sentTransactionStatusChanged
} from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { useEffect } from 'react'

import { useFetchPendingTransaction } from '@/api/apiDataHooks/transaction/useFetchPendingTransaction'
import { queryClient } from '@/api/queryClient'
import { useUnsortedAddressesHashes } from '@/hooks/addresses/useUnsortedAddresses'
import { useCurrentlyOnlineNetworkId } from '@/network/useCurrentlyOnlineNetworkId'
import { useSharedDispatch, useSharedSelector } from '@/redux'

export const usePendingTxPolling = (txHash: e.Transaction['hash']) => {
  const dispatch = useSharedDispatch()
  const networkId = useCurrentlyOnlineNetworkId()
  const sentTx = useSharedSelector((s) => selectSentTransactionByHash(s, txHash))
  const allAddressHashes = useUnsortedAddressesHashes()

  const { data: tx } = useFetchPendingTransaction({ txHash, skip: !sentTx || sentTx.status === 'confirmed' })

  useEffect(() => {
    if (!tx) return

    if (isConfirmedTx(tx)) {
      dispatch(sentTransactionStatusChanged({ hash: tx.hash, status: 'confirmed' }))

      findTransactionInternalAddresses(allAddressHashes, tx).forEach((addressHash) =>
        queryClient.refetchQueries({ queryKey: ['address', addressHash, 'transaction', 'latest', { networkId }] })
      )
    } else {
      dispatch(sentTransactionStatusChanged({ hash: tx.hash, status: 'mempooled' }))
    }
  }, [allAddressHashes, dispatch, networkId, tx])
}
