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

import { explorer } from '@alephium/web3'
import { createListenerMiddleware, createSlice, EntityState, isAnyOf, PayloadAction } from '@reduxjs/toolkit'
import { xorWith } from 'lodash'

import {
  syncAddressesData,
  syncAddressesTransactions,
  syncAddressTransactionsNextPage,
  syncAllAddressesTransactionsNextPage
} from '@/storage/addresses/addressesActions'
import { receiveTestnetTokens } from '@/storage/global/globalActions'
import { RootState } from '@/storage/store'
import { pendingTransactionsStorage } from '@/storage/transactions/pendingTransactionsPersistentStorage'
import { storedPendingTransactionsLoaded, transactionSent } from '@/storage/transactions/transactionsActions'
import { pendingTransactionsAdapter } from '@/storage/transactions/transactionsAdapters'
import { activeWalletDeleted, walletLocked, walletSwitched } from '@/storage/wallets/walletActions'
import { PendingTransaction } from '@/types/transactions'

type PendingTransactionsState = EntityState<PendingTransaction>

const initialState: PendingTransactionsState = pendingTransactionsAdapter.getInitialState()

const pendingTransactionsSlice = createSlice({
  name: 'pendingTransactions',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(transactionSent, pendingTransactionsAdapter.addOne)
      .addCase(receiveTestnetTokens.fulfilled, pendingTransactionsAdapter.addOne)
      .addCase(syncAddressesTransactions.fulfilled, removeTransactions)
      .addCase(syncAddressTransactionsNextPage.fulfilled, removeTransactions)
      .addCase(syncAllAddressesTransactionsNextPage.fulfilled, removeTransactions)
      .addCase(storedPendingTransactionsLoaded, pendingTransactionsAdapter.addMany)
      .addCase(walletLocked, () => initialState)
      .addCase(walletSwitched, () => initialState)
      .addCase(activeWalletDeleted, () => initialState)
  }
})

export default pendingTransactionsSlice

export const pendingTransactionsListenerMiddleware = createListenerMiddleware()

// Keep state and local storage of pending transactions in sync
pendingTransactionsListenerMiddleware.startListening({
  matcher: isAnyOf(
    transactionSent,
    syncAddressesData.fulfilled,
    receiveTestnetTokens.fulfilled,
    syncAddressTransactionsNextPage.fulfilled,
    syncAllAddressesTransactionsNextPage.fulfilled
  ),
  effect: (_, { getState }) => {
    const state = getState() as RootState
    const pendingTxsInState = Object.values(state.pendingTransactions.entities) as PendingTransaction[]
    const { id: walletId } = state.activeWallet

    if (!walletId) return

    const storedPendingTxs = pendingTransactionsStorage.load(walletId)
    const uniqueTransactions = xorWith(pendingTxsInState, storedPendingTxs, (a, b) => a.hash === b.hash)

    if (uniqueTransactions.length > 0) pendingTransactionsStorage.store(walletId, pendingTxsInState)
  }
})

// Reducers helper functions

const removeTransactions = (
  state: PendingTransactionsState,
  action: PayloadAction<
    { transactions: explorer.Transaction[] }[] | { transactions: explorer.Transaction[] } | undefined
  >
) => {
  const transactions = Array.isArray(action.payload)
    ? action.payload.flatMap((address) => address.transactions)
    : action.payload?.transactions

  if (transactions && transactions.length > 0) {
    pendingTransactionsAdapter.removeMany(
      state,
      transactions.map((tx) => tx.hash)
    )
  }
}
