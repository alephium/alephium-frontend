/*
Copyright 2018 - 2022 The Alephium Authors
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
import { createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'

import { AddressDataSyncResult, AddressHash } from '../types/addresses'
import { AddressConfirmedTransaction } from '../types/transactions'
import { selectAddressTransactions } from '../utils/addresses'
import {
  selectAllAddresses,
  syncAddressesData,
  syncAddressTransactionsNextPage,
  syncAllAddressesTransactionsNextPage
} from './addressesSlice'
import { RootState } from './store'

const sliceName = 'confirmedTransactions'

interface ConfirmedTransactionsState extends EntityState<explorer.Transaction> {
  allLoaded: boolean
  pageLoaded: number
}

const confirmedTransactionsAdapter = createEntityAdapter<explorer.Transaction>({
  selectId: (transaction) => transaction.hash,
  sortComparer: (a, b) => b.timestamp - a.timestamp
})

const initialState: ConfirmedTransactionsState = confirmedTransactionsAdapter.getInitialState({
  allLoaded: false,
  pageLoaded: 0
})

const confirmedTransactionsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncAddressesData.fulfilled, addTransactions)
      .addCase(syncAddressTransactionsNextPage.fulfilled, addTransactions)
      .addCase(syncAllAddressesTransactionsNextPage.fulfilled, (state, action) => {
        const { transactions, pageLoaded } = action.payload

        if (transactions.length > 0) {
          state.pageLoaded = pageLoaded
        } else {
          state.allLoaded = true
        }

        addTransactions(state, action)
      })
  }
})

export const { selectAll: selectAllConfirmedTransactions } = confirmedTransactionsAdapter.getSelectors<RootState>(
  (state) => state[sliceName]
)

export const selectAddressesConfirmedTransactions = createSelector(
  [
    selectAllAddresses,
    selectAllConfirmedTransactions,
    (_, addressHashes?: AddressHash | AddressHash[]) => addressHashes
  ],
  (allAddresses, confirmedTransactions, addressHashes): AddressConfirmedTransaction[] =>
    selectAddressTransactions(allAddresses, confirmedTransactions, addressHashes) as AddressConfirmedTransaction[]
)

export default confirmedTransactionsSlice

// TODO: Same as in desktop wallet, move to SDK?
const addTransactions = (
  state: ConfirmedTransactionsState,
  action: PayloadAction<AddressDataSyncResult[] | { transactions: explorer.Transaction[] } | undefined>
) => {
  const transactions = Array.isArray(action.payload)
    ? action.payload.flatMap((address) => address.transactions)
    : action.payload?.transactions

  if (transactions && transactions.length > 0) {
    confirmedTransactionsAdapter.upsertMany(state, transactions)
  }
}
