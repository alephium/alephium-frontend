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

import { AddressHash } from '@alephium/shared'
import { explorer } from '@alephium/web3'
import { createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'

import {
  selectAllAddresses,
  syncAddressesTransactions,
  syncAddressTransactionsNextPage,
  syncAllAddressesTransactionsNextPage,
  transactionSent
} from '~/store/addressesSlice'
import { RootState } from '~/store/store'
import { AddressPendingTransaction, PendingTransaction } from '~/types/transactions'
import { selectAddressTransactions, selectContactPendingTransactions } from '~/utils/addresses'

const sliceName = 'pendingTransactions'

const pendingTransactionsAdapter = createEntityAdapter<PendingTransaction>({
  selectId: (transaction) => transaction.hash,
  sortComparer: (a, b) => b.timestamp - a.timestamp
})

type PendingTransactionsState = EntityState<PendingTransaction>

const initialState: PendingTransactionsState = pendingTransactionsAdapter.getInitialState()

const pendingTransactionsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(transactionSent, pendingTransactionsAdapter.addOne)
      .addCase(syncAddressesTransactions.fulfilled, removeTransactions)
      .addCase(syncAddressTransactionsNextPage.fulfilled, removeTransactions)
      .addCase(syncAllAddressesTransactionsNextPage.fulfilled, removeTransactions)
  }
})

export const { selectAll: selectAllPendingTransactions } = pendingTransactionsAdapter.getSelectors<RootState>(
  (state) => state[sliceName]
)

export const makeSelectAddressesPendingTransactions = () =>
  createSelector(
    [
      selectAllAddresses,
      selectAllPendingTransactions,
      (_, addressHashes?: AddressHash | AddressHash[]) => addressHashes
    ],
    (allAddresses, pendingTransactions, addressHashes): AddressPendingTransaction[] =>
      selectAddressTransactions(allAddresses, pendingTransactions, addressHashes) as AddressPendingTransaction[]
  )

export const makeSelectContactPendingTransactions = () =>
  createSelector(
    [selectAllAddresses, selectAllPendingTransactions, (_, contactAddressHash: AddressHash) => contactAddressHash],
    (allAddresses, pendingTransactions, contactAddressHash): AddressPendingTransaction[] =>
      selectContactPendingTransactions(
        allAddresses,
        pendingTransactions,
        contactAddressHash
      ) as AddressPendingTransaction[]
  )

export default pendingTransactionsSlice

// TODO: Same as in desktop wallet, move to SDK?
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
