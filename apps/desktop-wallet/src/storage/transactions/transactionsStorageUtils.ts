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

import { MempoolTransaction } from '@alephium/web3/dist/src/api/api-explorer'
import posthog from 'posthog-js'

import { store } from '@/storage/store'
import { pendingTransactionsStorage } from '@/storage/transactions/pendingTransactionsPersistentStorage'
import {
  loadingPendingTransactionsFailed,
  storedPendingTransactionsLoaded
} from '@/storage/transactions/transactionsActions'
import { PendingTransaction } from '@/types/transactions'
import { StoredWallet } from '@/types/wallet'

export const restorePendingTransactions = (
  walletId: StoredWallet['id'],
  mempoolTxHashes: MempoolTransaction['hash'][],
  storedPendingTxs: PendingTransaction[]
) => {
  try {
    const usefulPendingTxs = storedPendingTxs.filter((tx) => mempoolTxHashes.includes(tx.hash))

    store.dispatch(storedPendingTransactionsLoaded(usefulPendingTxs))
    pendingTransactionsStorage.store(walletId, usefulPendingTxs)
  } catch (e) {
    console.error(e)
    store.dispatch(loadingPendingTransactionsFailed())
    posthog.capture('Error', { message: 'Restoring pending transactions' })
  }
}
