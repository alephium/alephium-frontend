import { findTransactionInternalAddresses, isConfirmedTx } from '@alephium/shared'
import { queryClient, useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import { useEffect } from 'react'

import useFetchPendingTransaction from '@/api/apiDataHooks/transaction/useFetchPendingTransaction'
import { sentTransactionStatusChanged } from '@/features/send/sentTransactions/sentTransactionsActions'
import { selectSentTransactionByHash } from '@/features/send/sentTransactions/sentTransactionsSelectors'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'

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
