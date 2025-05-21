import { keyring, NonSensitiveAddressData } from '@alephium/keyring'
import {
  activeWalletDeleted,
  Address,
  addressesImported,
  AddressIndex,
  appReset,
  customNetworkSettingsSaved,
  networkPresetSwitched,
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
import {
  findMaxIndexBeforeFirstGap,
  findNextAvailableAddressIndex,
  initializeAddressDiscoveryGroupsData
} from '~/utils/addresses'
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
    const addresses = Object.values(state.addresses.entities) as Address[]
    const activeAddressIndexes: AddressIndex[] = addresses.map((address) => address.index)
    const groupsData = initializeAddressDiscoveryGroupsData(addresses)
    const derivedDataCache = new Map<AddressIndex, NonSensitiveAddressData & { group: number }>()

    let group = 0
    let checkedIndexes = Array.from(activeAddressIndexes)
    let maxIndexBeforeFirstGap = findMaxIndexBeforeFirstGap(activeAddressIndexes)

    dispatch(algoDataInitialized())

    try {
      await initializeKeyringWithStoredWallet()

      while (group < 4) {
        const groupData = groupsData[group]
        let newAddressGroup: number | undefined = undefined
        let index = groupData.highestIndex ?? maxIndexBeforeFirstGap
        let newAddressData: NonSensitiveAddressData | undefined = undefined

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
            newAddressData = keyring.generateAndCacheAddress({ addressIndex: index, keyType: 'default' })
            newAddressGroup = groupOfAddress(newAddressData.hash)
            derivedDataCache.set(index, { ...newAddressData, group: newAddressGroup })
          }
        }

        if (!newAddressData) {
          continue
        }

        groupData.highestIndex = newAddressData.index

        const data = await throttledClient.explorer.addresses.postAddressesUsed([newAddressData.hash])
        const addressIsActive = data.length > 0 && data[0]

        if (addressIsActive) {
          const { balance } = await throttledClient.explorer.addresses.getAddressesAddressBalance(newAddressData.hash)
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
        activeWalletDeleted,
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
