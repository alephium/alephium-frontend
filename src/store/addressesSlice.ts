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

import { addressToGroup, TOTAL_NUMBER_OF_GROUPS } from '@alephium/sdk'
import { AddressInfo, Transaction } from '@alephium/sdk/api/explorer'
import { createAsyncThunk, createEntityAdapter, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'

import client from '../api/client'
import { AddressHash, AddressSettings } from '../types/addresses'
import { TimeInMs } from '../types/numbers'
import { PendingTx } from '../types/transactions'
import { RootState } from './store'

const sliceName = 'addresses'

type Address = {
  hash: string
  publicKey: string
  privateKey: string
  group: number
  index: number
  settings: AddressSettings
  networkData: {
    details: AddressInfo
    transactions: {
      confirmed: Transaction[]
      pending: PendingTx[]
      loadedPage: number
    }
    availableBalance: string
    lockedBalance: string
    lastUsed: TimeInMs
  }
}

type AddressPartial = {
  hash: string
  publicKey: string
  privateKey: string
  index: number
  settings: AddressSettings
}

const addressSettingsAdapter = createEntityAdapter<Address>({
  selectId: (address) => address.hash,
  sortComparer: (a, b) => {
    // Always keep main address to the top of the list
    if (a.settings.isMain) return -1
    if (b.settings.isMain) return 1
    return (b.networkData?.lastUsed ?? 0) - (a.networkData?.lastUsed ?? 0)
  }
})

interface AddressesState extends EntityState<Address> {
  mainAddress: string
  loading: boolean
}

const initialState: AddressesState = addressSettingsAdapter.getInitialState({
  mainAddress: '',
  loading: false
})

export const fetchAddressesData = createAsyncThunk(
  `${sliceName}/fetchAddressesData`,
  async (payload: AddressHash[], { dispatch }) => {
    const results = []
    dispatch(loadingStarted())

    for (const address of payload) {
      const { data } = await client.explorerClient.getAddressDetails(address)
      const availableBalance = data.balance
        ? data.lockedBalance
          ? (BigInt(data.balance) - BigInt(data.lockedBalance)).toString()
          : data.balance
        : undefined

      results.push({
        hash: address,
        details: data,
        availableBalance: availableBalance
      })
    }

    dispatch(loadingFinished())
    return results
  }
)

const addressesSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    addressesAdded: (state, action: PayloadAction<AddressPartial[]>) => {
      const addresses = action.payload

      const newMainAddress = addresses.find((address) => address.settings.isMain)
      if (newMainAddress) {
        state.mainAddress = newMainAddress.hash

        const previousMainAddress = state.entities[state.mainAddress]
        if (previousMainAddress) {
          previousMainAddress.settings.isMain = false
        }
      }

      addressSettingsAdapter.addMany(
        state,
        addresses.map((address) => ({
          ...address,
          group: addressToGroup(address.hash, TOTAL_NUMBER_OF_GROUPS),
          networkData: {
            details: {
              balance: '0',
              lockedBalance: '0',
              txNumber: 0
            },
            transactions: {
              confirmed: [],
              pending: [],
              loadedPage: 0
            },
            availableBalance: '0',
            lockedBalance: '0',
            lastUsed: 0
          }
        }))
      )
    },
    addressesFlushed: (state) => {
      addressSettingsAdapter.setAll(state, [])
    },
    loadingStarted: (state) => {
      state.loading = true
    },
    loadingFinished: (state) => {
      state.loading = false
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAddressesData.fulfilled, (state, action) => {
      for (const address of action.payload) {
        const { hash, details, availableBalance } = address

        const addressState = state.entities[hash]
        if (addressState) {
          addressState.networkData.details = details
          if (availableBalance) addressState.networkData.availableBalance = availableBalance
        }
      }
    })
  }
})

export const { selectById: selectAddressByHash, selectAll: selectAllAddresses } =
  addressSettingsAdapter.getSelectors<RootState>((state) => state[sliceName])

export const { addressesAdded, addressesFlushed, loadingStarted, loadingFinished } = addressesSlice.actions

export default addressesSlice
