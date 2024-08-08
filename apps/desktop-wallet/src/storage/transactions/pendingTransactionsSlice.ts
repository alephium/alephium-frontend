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
import { createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'

import {
  syncAddressesTransactions,
  syncAddressTransactionsNextPage,
  syncAllAddressesTransactionsNextPage
} from '@/storage/addresses/addressesActions'
import { receiveTestnetTokens } from '@/storage/global/globalActions'
import { transactionSent } from '@/storage/transactions/transactionsActions'
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
      .addCase(walletLocked, () => initialState)
      .addCase(walletSwitched, () => initialState)
      .addCase(activeWalletDeleted, () => initialState)
  }
})

export default pendingTransactionsSlice

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
