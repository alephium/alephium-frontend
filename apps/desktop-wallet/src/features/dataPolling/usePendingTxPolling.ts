/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { findTransactionInternalAddresses, isConfirmedTx } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { useEffect } from 'react'

import useFetchPendingTransaction from '@/api/apiDataHooks/transaction/useFetchPendingTransaction'
import queryClient from '@/api/queryClient'
import { sentTransactionStatusChanged } from '@/features/send/sentTransactions/sentTransactionsActions'
import { selectSentTransactionByHash } from '@/features/send/sentTransactions/sentTransactionsSelectors'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

const usePendingTxPolling = (txHash: e.Transaction['hash']) => {
  const dispatch = useAppDispatch()
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
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
