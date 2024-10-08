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
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { pendingTransactionQuery } from '@/api/queries/transactionQueries'
import queryClient from '@/api/queryClient'
import { sentTransactionStatusChanged } from '@/features/sentTransactions/sentTransactionsActions'
import { selectSentTransactionByHash } from '@/features/sentTransactions/sentTransactionsSelectors'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useAddresses'

const usePendingTxPolling = (txHash: Transaction['hash']) => {
  const dispatch = useAppDispatch()
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const sentTx = useAppSelector((s) => selectSentTransactionByHash(s, txHash))
  const allAddressHashes = useUnsortedAddressesHashes()

  const { data: tx } = useQuery(pendingTransactionQuery({ txHash, skip: !sentTx || sentTx.status === 'confirmed' }))

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
