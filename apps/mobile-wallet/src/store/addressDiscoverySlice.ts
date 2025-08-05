import { keyring, NonSensitiveAddressData } from '@alephium/keyring'
import {
  activeWalletDeleted,
  addressDeleted,
  addressesImported,
  AddressIndex,
  appReset,
  customNetworkSettingsSaved,
  findNextAvailableAddressIndex,
  GROUPLESS_ADDRESS_KEY_TYPE,
  networkPresetSwitched,
  selectAllAddressIndexes,
  throttledClient
} from '@alephium/shared'
import { explorer, groupOfAddress, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  EntityState,
  isAnyOf,
  PayloadAction
} from '@reduxjs/toolkit'

import { initializeKeyringWithStoredWallet } from '~/persistent-storage/wallet'
import { RootState } from '~/store/store'
import { newWalletGenerated, newWalletImportedWithMetadata } from '~/store/wallet/walletActions'
import { findMaxIndexBeforeFirstGap } from '~/utils/addresses'
import { sleep } from '~/utils/misc'

const sliceName = 'addressDiscovery'

export type DiscoveredAddress = NonSensitiveAddressData & { balance: explorer.AddressInfo['balance'] }

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
    const { indexesOfAddressesWithGroup, indexesOfGrouplessAddresses } = selectAllAddressIndexes(state)

    dispatch(algoDataInitialized())

    try {
      await initializeKeyringWithStoredWallet()

      // Groupless addresses
      let gap = 0
      const checkedGrouplessIndexes = Array.from(indexesOfGrouplessAddresses)

      while (gap < minGap) {
        const maxIndexBeforeFirstGap = findMaxIndexBeforeFirstGap(indexesOfGrouplessAddresses)
        const index = findNextAvailableAddressIndex(maxIndexBeforeFirstGap, checkedGrouplessIndexes)
        checkedGrouplessIndexes.push(index)
        checkedGrouplessIndexes.sort((a, b) => a - b)
        await sleep(1) // Allow execution to continue to not block rendering
        const newGrouplessAddressData = keyring.generateAndCacheAddress({
          addressIndex: index,
          keyType: GROUPLESS_ADDRESS_KEY_TYPE
        })

        const data = await throttledClient.explorer.addresses.postAddressesUsed([newGrouplessAddressData.hash])
        const addressIsActive = data.length > 0 && data[0]

        if (addressIsActive) {
          gap = 0
          const { balance } = await throttledClient.explorer.addresses.getAddressesAddressBalance(
            newGrouplessAddressData.hash
          )
          dispatch(addressDiscovered({ ...newGrouplessAddressData, balance }))

          indexesOfGrouplessAddresses.push(newGrouplessAddressData.index)
          indexesOfGrouplessAddresses.sort((a, b) => a - b)
        } else {
          gap += 1
        }

        if (gap === minGap) {
          dispatch(finishedWithGroupless())
        }
      }

      // "Old" addresses (addresses with group)
      const derivedDataCache = new Map<AddressIndex, NonSensitiveAddressData & { group: number }>()
      let group = 0
      gap = 0
      let checkedIndexes = Array.from(indexesOfAddressesWithGroup)

      while (group < 4) {
        let newAddressGroup: number | undefined = undefined
        let index = findMaxIndexBeforeFirstGap(checkedIndexes)
        let newAddressData: NonSensitiveAddressData | undefined = undefined

        while (newAddressGroup !== group) {
          index = findNextAvailableAddressIndex(index, checkedIndexes)
          checkedIndexes.push(index)
          checkedIndexes.sort((a, b) => a - b)

          const cachedData = derivedDataCache.get(index)

          if (cachedData) {
            if (cachedData.group !== group) {
              continue
            }

            newAddressData = cachedData
            newAddressGroup = cachedData.group
          } else {
            await sleep(1) // Allow execution to continue to not block rendering
            newAddressData = keyring.generateAndCacheAddress({
              addressIndex: index,
              keyType: 'default'
            })
            newAddressGroup = groupOfAddress(newAddressData.hash)
            derivedDataCache.set(index, { ...newAddressData, group: newAddressGroup })
          }
        }

        if (!newAddressData) {
          continue
        }

        const data = await throttledClient.explorer.addresses.postAddressesUsed([newAddressData.hash])
        const addressIsActive = data.length > 0 && data[0]

        if (addressIsActive) {
          gap = 0

          const { balance } = await throttledClient.explorer.addresses.getAddressesAddressBalance(newAddressData.hash)
          dispatch(addressDiscovered({ ...newAddressData, balance }))

          indexesOfAddressesWithGroup.push(newAddressData.index)
          indexesOfAddressesWithGroup.sort((a, b) => a - b)
        } else {
          gap += 1
        }

        if (gap === minGap) {
          dispatch(finishedWithGroup(group))

          group += 1
          gap = 0
          checkedIndexes = Array.from(indexesOfAddressesWithGroup)
        }

        const state = getState() as RootState
        if (state.addressDiscovery.status === 'stopped') {
          return
        }
      }
    } catch (e) {
      if (__DEV__) console.error(e)
    } finally {
      keyring.clear()
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
    finishedWithGroupless: (state) => {
      state.progress = 1 / (TOTAL_NUMBER_OF_GROUPS + 1)
    },
    finishedWithGroup: (state, action: PayloadAction<number>) => {
      const group = action.payload

      state.progress = (group + 2) / (TOTAL_NUMBER_OF_GROUPS + 1)
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
        activeWalletDeleted,
        networkPresetSwitched,
        addressDeleted,
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
  finishedWithGroup,
  finishedWithGroupless
} = addressDiscoverySlice.actions

export default addressDiscoverySlice
