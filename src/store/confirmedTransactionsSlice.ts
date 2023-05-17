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

import { AddressHash } from '../types/addresses'
import { AddressConfirmedTransaction } from '../types/transactions'
import { selectAddressTransactions } from '../utils/addresses'
import { selectAllAddresses, syncAddressesData, syncAddressesTransactionsNextPage } from './addressesSlice'
import { RootState } from './store'

const sliceName = 'confirmedTransactions'

type ConfirmedTransactionsState = EntityState<explorer.Transaction>

const confirmedTransactionsAdapter = createEntityAdapter<explorer.Transaction>({
  selectId: (transaction) => transaction.hash,
  sortComparer: (a, b) => b.timestamp - a.timestamp
})

const initialState: ConfirmedTransactionsState = confirmedTransactionsAdapter.getInitialState()

const confirmedTransactionsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncAddressesData.fulfilled, addTransactions)
      .addCase(syncAddressesTransactionsNextPage.fulfilled, addTransactions)
  }
})

export const { selectAll: selectAllConfirmedTransactions } = confirmedTransactionsAdapter.getSelectors<RootState>(
  (state) => state[sliceName]
)

export const selectAddressesConfirmedTransactions = createSelector(
  [selectAllAddresses, selectAllConfirmedTransactions, (_, addressHashes: AddressHash[]) => addressHashes],
  (allAddresses, confirmedTransactions, addressHashes): AddressConfirmedTransaction[] =>
    selectAddressTransactions(allAddresses, confirmedTransactions, addressHashes) as AddressConfirmedTransaction[]
)

export default confirmedTransactionsSlice

const addTransactions = (
  state: ConfirmedTransactionsState,
  action: PayloadAction<{ transactions: explorer.Transaction[] }[]>
) => {
  const addresses = action.payload
  const transactions = addresses.flatMap((address) => address.transactions)

  confirmedTransactionsAdapter.upsertMany(state, transactions)
}
