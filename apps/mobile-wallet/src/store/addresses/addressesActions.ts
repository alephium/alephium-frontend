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

import {
  ADDRESSES_QUERY_LIMIT,
  AddressHash,
  client,
  extractNewTransactions,
  getTransactionsOfAddress
} from '@alephium/shared'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { chunk } from 'lodash'

import { selectAddressByHash, syncAddressesBalances, syncAddressesTokens } from '~/store/addressesSlice'
import { RootState } from '~/store/store'

export const syncLatestTransactions = createAsyncThunk(
  'addresses/syncLatestTransactions',
  async (payload: AddressHash | AddressHash[] | undefined, { getState, dispatch }) => {
    console.log('Checking for new transactions')

    const state = getState() as RootState
    const addresses =
      payload !== undefined ? (Array.isArray(payload) ? payload : [payload]) : (state.addresses.ids as AddressHash[])

    const results = await Promise.all(
      chunk(addresses, ADDRESSES_QUERY_LIMIT).map((addressesChunk) =>
        client.explorer.addresses.postAddressesTransactions({ page: 1 }, addressesChunk)
      )
    )

    const latestTransactions = results.flat()

    const newTransactionsResults = addresses.reduce(
      (acc, addressHash) => {
        const transactionsOfAddress = getTransactionsOfAddress(latestTransactions, addressHash)
        const address = selectAddressByHash(state, addressHash)

        if (!address) return acc

        const newTransactions = extractNewTransactions(transactionsOfAddress, address.transactions)

        if (newTransactions.length > 0)
          acc.push({
            hash: address.hash,
            newTransactions
          })

        return acc
      },
      [] as {
        hash: AddressHash
        newTransactions: Transaction[]
      }[]
    )

    const addressesWithNewTransactions = newTransactionsResults.map(({ hash }) => hash)

    if (addressesWithNewTransactions.length > 0) {
      dispatch(syncAddressesBalances(addressesWithNewTransactions))
      dispatch(syncAddressesTokens(addressesWithNewTransactions))
    }

    return newTransactionsResults
  }
)
