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

import {
  AddressKeyPair,
  addressToGroup,
  deriveAddressAndKeys,
  TOTAL_NUMBER_OF_GROUPS,
  Wallet,
  walletImportAsyncUnsafe
} from '@alephium/sdk'
import { AddressInfo } from '@alephium/sdk/api/explorer'
import { createAsyncThunk, createEntityAdapter, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'

import client from '../api/client'
import { Address, AddressIndex } from '../types/addresses'
import { findMaxIndexBeforeFirstGap, findNextAvailableAddressIndex } from '../utils/addresses'
import { getRandomLabelColor } from '../utils/colors'
import { mnemonicToSeed } from '../utils/crypto'
import { sleep } from '../utils/misc'
import { addressesAdded, newAddressesStoredAndInitialized } from './addressesSlice'
import { RootState } from './store'

const sliceName = 'addressDiscovery'

export type DiscoveredAddress = AddressKeyPair & { balance: AddressInfo['balance'] }

interface AddressDiscoveryState extends EntityState<DiscoveredAddress> {
  loading: boolean
  progress: number
  status: 'idle' | 'started' | 'stopped' | 'finished'
}

const addressDiscoveryAdapter = createEntityAdapter<DiscoveredAddress>({
  selectId: (address) => address.hash
})

const initialState: AddressDiscoveryState = addressDiscoveryAdapter.getInitialState({
  loading: false,
  progress: 0,
  status: 'idle'
})

type AddressDiscoveryGroupData = {
  highestIndex: AddressIndex | undefined
  gap: number
}

const initializeAddressDiscoveryGroupsData = (addresses: Address[]): AddressDiscoveryGroupData[] => {
  const groupsData: AddressDiscoveryGroupData[] = Array.from({ length: TOTAL_NUMBER_OF_GROUPS }, () => ({
    highestIndex: undefined,
    gap: 0
  }))

  for (const address of addresses) {
    const groupData = groupsData[address.group]

    if (groupData.highestIndex === undefined || groupData.highestIndex < address.index) {
      groupData.highestIndex = address.index
    }
  }

  return groupsData
}

export const addressesDiscovered = createAsyncThunk(
  `${sliceName}/addressesDiscovered`,
  async (payload: { autoImport: boolean; masterKey: Wallet['masterKey'] } | void, { getState, dispatch }) => {
    dispatch(addressDiscoveryStarted())

    const minGap = 5
    const state = getState() as RootState
    await sleep(1) // Allow execution to continue to not block rendering
    const { masterKey } = payload?.masterKey
      ? payload
      : await walletImportAsyncUnsafe(mnemonicToSeed, state.activeWallet.mnemonic)
    const addresses = Object.values(state.addresses.entities) as Address[]
    const activeAddressIndexes: AddressIndex[] = payload?.autoImport ? [0] : addresses.map((address) => address.index)
    const groupsData = initializeAddressDiscoveryGroupsData(addresses)
    const derivedDataCache = new Map<AddressIndex, AddressKeyPair & { group: number }>()

    let group = 0
    let checkedIndexes = Array.from(activeAddressIndexes)
    let maxIndexBeforeFirstGap = findMaxIndexBeforeFirstGap(activeAddressIndexes)

    dispatch(progressUpdated(0.1))

    try {
      while (group < 4) {
        const groupData = groupsData[group]
        let newAddressGroup: number | undefined = undefined
        let index = groupData.highestIndex ?? maxIndexBeforeFirstGap
        let newAddressData: AddressKeyPair | undefined = undefined

        while (newAddressGroup !== group) {
          index = findNextAvailableAddressIndex(index, checkedIndexes)
          checkedIndexes.push(index)

          const cachedData = derivedDataCache.get(index)

          if (cachedData) {
            if (cachedData.group !== group) {
              continue
            }

            newAddressData = cachedData
            newAddressGroup = cachedData.group
          } else {
            await sleep(1)
            newAddressData = deriveAddressAndKeys(masterKey, index)
            newAddressGroup = addressToGroup(newAddressData.hash, TOTAL_NUMBER_OF_GROUPS)
            derivedDataCache.set(index, { ...newAddressData, group: newAddressGroup })
          }
        }

        if (!newAddressData) {
          continue
        }

        groupData.highestIndex = newAddressData.index

        const { data } = await client.explorerClient.addressesActive.postAddressesActive([newAddressData.hash])
        const addressIsActive = data.length > 0 && data[0]

        if (addressIsActive) {
          if (payload?.autoImport) {
            dispatch(
              newAddressesStoredAndInitialized([
                { ...newAddressData, settings: { isMain: false, color: getRandomLabelColor() } }
              ])
            )
          } else {
            const {
              data: { balance }
            } = await client.explorerClient.getAddressDetails(newAddressData.hash)
            dispatch(addressDiscovered({ ...newAddressData, balance }))
          }

          groupData.gap = 0
          activeAddressIndexes.push(newAddressData.index)
          maxIndexBeforeFirstGap =
            newAddressData.index === maxIndexBeforeFirstGap + 1 ? maxIndexBeforeFirstGap + 1 : maxIndexBeforeFirstGap
        } else {
          groupData.gap += 1
        }

        if (groupData.gap === minGap) {
          group += 1
          checkedIndexes = Array.from(activeAddressIndexes)

          if (group < 5) {
            dispatch(progressUpdated(group / TOTAL_NUMBER_OF_GROUPS))
          }
        }

        const state = getState() as RootState
        if (state.addressDiscovery.status === 'stopped') {
          return
        }
      }
    } catch (e) {
      console.error(e)
    }

    if (state.addressDiscovery.status !== 'stopped') {
      dispatch(addressDiscoveryFinished())
    }
  }
)

const addressDiscoverySlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    addressDiscoveryStarted: (state) => {
      state.loading = true
      state.status = 'started'
    },
    addressDiscoveryStopped: (state) => {
      state.loading = false
      state.status = 'stopped'
    },
    addressDiscoveryFinished: (state) => {
      state.loading = false
      state.status = 'finished'
    },
    progressUpdated: (state, action: PayloadAction<number>) => {
      state.progress = action.payload
    },
    addressDiscovered: (state, action: PayloadAction<DiscoveredAddress>) => {
      addressDiscoveryAdapter.upsertOne(state, action.payload)
    }
  },
  extraReducers: (builder) => {
    builder.addCase(addressesAdded, (state, action) => {
      const addresses = action.payload

      addressDiscoveryAdapter.removeMany(
        state,
        addresses.map((address) => address.hash)
      )
    })
  }
})

export const {
  selectById: selectDiscoveredAddressByHash,
  selectAll: selectAllDiscoveredAddresses,
  selectIds: selectDiscoveredAddressIds
} = addressDiscoveryAdapter.getSelectors<RootState>((state) => state[sliceName])

export const {
  addressDiscoveryStarted,
  addressDiscoveryStopped,
  addressDiscoveryFinished,
  progressUpdated,
  addressDiscovered
} = addressDiscoverySlice.actions

export default addressDiscoverySlice
