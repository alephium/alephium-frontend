import {
  findTransactionInternalAddresses,
  isConfirmedTx,
  selectSentTransactionByHash,
  sentTransactionStatusChanged
} from '@alephium/shared'
import {
  queryClient,
  useCurrentlyOnlineNetworkId,
  useFetchPendingTransaction,
  useUnsortedAddressesHashes
} from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import { useEffect } from 'react'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'

const usePendingTxPolling = (txHash: e.Transaction['hash']) => {
  const dispatch = useAppDispatch()
  const networkId = useCurrentlyOnlineNetworkId()
  const sentTx = useAppSelector((s) => selectSentTransactionByHash(s, txHash))
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

export default usePendingTxPolling
