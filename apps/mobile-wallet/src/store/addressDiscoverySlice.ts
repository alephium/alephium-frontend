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

import { AddressKeyPair, deriveAddressAndKeys, walletImportAsyncUnsafe } from '@alephium/shared'
import { addressToGroup, explorer, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityState,
  isAnyOf,
  PayloadAction
} from '@reduxjs/toolkit'

import client from '~/api/client'
import { addressesImported } from '~/store/addressesSlice'
import { appReset } from '~/store/appSlice'
import { customNetworkSettingsSaved, networkPresetSwitched } from '~/store/networkSlice'
import { RootState } from '~/store/store'
import { newWalletGenerated, newWalletImportedWithMetadata, walletDeleted } from '~/store/wallet/walletActions'
import { Address, AddressIndex } from '~/types/addresses'
import {
  findMaxIndexBeforeFirstGap,
  findNextAvailableAddressIndex,
  initializeAddressDiscoveryGroupsData
} from '~/utils/addresses'
import { mnemonicToSeed } from '~/utils/crypto'
import { sleep } from '~/utils/misc'

const sliceName = 'addressDiscovery'

export type DiscoveredAddress = AddressKeyPair & { balance: explorer.AddressInfo['balance'] }

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

export const discoverAddresses = createAsyncThunk(
  `${sliceName}/discoverAddresses`,
  async (_, { getState, dispatch }) => {
    dispatch(addressDiscoveryStarted())

    const minGap = 5
    const state = getState() as RootState
    await sleep(1) // Allow execution to continue to not block rendering
    const { masterKey } = await walletImportAsyncUnsafe(mnemonicToSeed, state.wallet.mnemonic)
    const addresses = Object.values(state.addresses.entities) as Address[]
    const activeAddressIndexes: AddressIndex[] = addresses.map((address) => address.index)
    const groupsData = initializeAddressDiscoveryGroupsData(addresses)
    const derivedDataCache = new Map<AddressIndex, AddressKeyPair & { group: number }>()

    let group = 0
    let checkedIndexes = Array.from(activeAddressIndexes)
    let maxIndexBeforeFirstGap = findMaxIndexBeforeFirstGap(activeAddressIndexes)

    dispatch(algoDataInitialized())

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
            await sleep(1) // Allow execution to continue to not block rendering
            newAddressData = deriveAddressAndKeys(masterKey, index)
            newAddressGroup = addressToGroup(newAddressData.hash, TOTAL_NUMBER_OF_GROUPS)
            derivedDataCache.set(index, { ...newAddressData, group: newAddressGroup })
          }
        }

        if (!newAddressData) {
          continue
        }

        groupData.highestIndex = newAddressData.index

        const data = await client.explorer.addresses.postAddressesUsed([newAddressData.hash])
        const addressIsActive = data.length > 0 && data[0]

        if (addressIsActive) {
          const { balance } = await client.explorer.addresses.getAddressesAddressBalance(newAddressData.hash)
          dispatch(addressDiscovered({ ...newAddressData, balance }))

          groupData.gap = 0
          activeAddressIndexes.push(newAddressData.index)
          maxIndexBeforeFirstGap =
            newAddressData.index === maxIndexBeforeFirstGap + 1 ? maxIndexBeforeFirstGap + 1 : maxIndexBeforeFirstGap
        } else {
          groupData.gap += 1
        }

        if (groupData.gap === minGap) {
          dispatch(finishedWithGroup(group))

          group += 1
          checkedIndexes = Array.from(activeAddressIndexes)
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
    algoDataInitialized: (state) => {
      state.progress = 0.1
    },
    finishedWithGroup: (state, action: PayloadAction<number>) => {
      const group = action.payload

      state.progress = (group + 1) / TOTAL_NUMBER_OF_GROUPS
    },
    addressDiscovered: (state, action: PayloadAction<DiscoveredAddress>) => {
      addressDiscoveryAdapter.upsertOne(state, action.payload)
    }
  },
  extraReducers: (builder) => {
    builder.addCase(addressesImported, (state, action) => {
      const addresses = action.payload

      addressDiscoveryAdapter.removeMany(
        state,
        addresses.map((address) => address.hash)
      )
    })
    builder.addMatcher(
      isAnyOf(
        newWalletGenerated,
        newWalletImportedWithMetadata,
        appReset,
        walletDeleted,
        networkPresetSwitched,
        customNetworkSettingsSaved
      ),
      () => initialState
    )
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
  addressDiscovered,
  algoDataInitialized,
  finishedWithGroup
} = addressDiscoverySlice.actions

export default addressDiscoverySlice
