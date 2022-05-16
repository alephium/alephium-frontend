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
import { createEntityAdapter, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'

import { AddressSettings } from '../types/addresses'
import { TimeInMs } from '../types/numbers'
import { PendingTx } from '../types/transactions'
import { RootState } from './store'

const name = 'addresses'

type Address = {
  hash: string
  publicKey: string
  privateKey: string
  group: number
  index: number
  settings: AddressSettings
  networkData?: {
    details: AddressInfo
    transactions: {
      confirmed: Transaction[]
      pending: PendingTx[]
      loadedPage: number
    }
    availableBalance: bigint
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
}

const initialState: AddressesState = addressSettingsAdapter.getInitialState({
  mainAddress: ''
})

const addressesSlice = createSlice({
  name,
  initialState,
  reducers: {
    addressAdded: (state, action: PayloadAction<AddressPartial>) => {
      addressSettingsAdapter.addOne(state, {
        ...action.payload,
        group: addressToGroup(action.payload.hash, TOTAL_NUMBER_OF_GROUPS)
      })

      if (action.payload.settings.isMain) {
        const previousMainAddress = state.entities[action.payload.hash]
        if (previousMainAddress) {
          previousMainAddress.settings.isMain = false
        }
        state.mainAddress = action.payload.hash
      }
    },
    addressesFlushed: (state) => {
      addressSettingsAdapter.setAll(state, [])
    }
  }
})

export const { selectById: selectAddressByHash, selectAll: selectAllAddresses } =
  addressSettingsAdapter.getSelectors<RootState>((state) => state[name])

export const { addressAdded, addressesFlushed } = addressesSlice.actions

export default addressesSlice
