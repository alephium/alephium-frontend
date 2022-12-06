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
  AddressAndKeys,
  addressToGroup,
  deriveAddressAndKeys,
  deriveNewAddressData,
  TOTAL_NUMBER_OF_GROUPS,
  Wallet,
  walletImportAsyncUnsafe
} from '@alephium/sdk'
import { AddressInfo, Transaction } from '@alephium/sdk/api/explorer'
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction
} from '@reduxjs/toolkit'

import client from '../api/client'
import { getAddressesMetadataByWalletId, storeAddressMetadata } from '../storage/wallets'
import { AddressHash, AddressSettings } from '../types/addresses'
import { TimeInMs } from '../types/numbers'
import { AddressToken } from '../types/tokens'
import { PendingTransaction } from '../types/transactions'
import { fetchAddressesData } from '../utils/addresses'
import { mnemonicToSeed } from '../utils/crypto'
import { sleep } from '../utils/misc'
import { extractNewTransactions, extractRemainingPendingTransactions } from '../utils/transactions'
import { RootState } from './store'

const sliceName = 'addresses'

export type Address = {
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
      pending: PendingTransaction[]
      loadedPage: number
      allPagesLoaded: boolean
    }
    availableBalance: string
    lastUsed: TimeInMs
    tokens: AddressToken[]
  }
}

export type AddressPartial = {
  hash: string
  publicKey: string
  privateKey: string
  index: number
  settings: AddressSettings
}

const addressesAdapter = createEntityAdapter<Address>({
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
  addressDiscoveryLoading: boolean
  status: 'uninitialized' | 'initialized'
  discoveredAddresses: AddressAndKeys[]
}

const initialState: AddressesState = addressesAdapter.getInitialState({
  mainAddress: '',
  loading: false,
  addressDiscoveryLoading: false,
  status: 'uninitialized',
  discoveredAddresses: []
})

export const addressesDataFetched = createAsyncThunk(
  `${sliceName}/addressesDataFetched`,
  async (payload: AddressHash[], { dispatch }) => {
    dispatch(loadingStarted())

    const addresses = payload
    const results = await fetchAddressesData(addresses)

    dispatch(loadingFinished())
    return results
  }
)

export const fetchAddressesTransactionsNextPage = createAsyncThunk(
  `${sliceName}/fetchAddressesTransactionsNextPage`,
  async (payload: AddressHash[], { getState, dispatch }) => {
    const results = []
    dispatch(loadingStarted())

    const state = getState() as RootState

    const addresses = payload

    for (const addressHash of addresses) {
      const address = state.addresses.entities[addressHash]
      const allPagesLoaded = address?.networkData.transactions.allPagesLoaded
      const latestPage = address?.networkData.transactions.loadedPage ?? 0
      let nextPage = latestPage
      let newTransactions = [] as Transaction[]

      if (!allPagesLoaded) {
        nextPage += 1
        console.log(`⬇️ Fetching page ${nextPage} of address confirmed transactions: `, addressHash)
        const { data: transactions } = await client.explorerClient.getAddressTransactions(addressHash, nextPage)
        newTransactions = transactions
      }

      results.push({
        hash: addressHash,
        transactions: newTransactions,
        page: nextPage
      })
    }

    dispatch(loadingFinished())
    return results
  }
)

export const addressesFromStoredMetadataInitialized = createAsyncThunk(
  `${sliceName}/addressesFromStoredMetadataInitialized`,
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState

    const { metadataId, mnemonic } = state.activeWallet

    if (metadataId && mnemonic) {
      dispatch(loadingStarted())

      const { masterKey } = await walletImportAsyncUnsafe(mnemonicToSeed, mnemonic)
      const addressesMetadata = await getAddressesMetadataByWalletId(metadataId)

      console.log(`👀 Found ${addressesMetadata.length} addresses metadata in persistent storage`)

      const addresses = addressesMetadata.map(({ index, ...settings }) => {
        const { address, publicKey, privateKey } = deriveNewAddressData(masterKey, undefined, index)
        return { hash: address, publicKey, privateKey, index, settings }
      })

      dispatch(addressesAdded(addresses))
      await dispatch(addressesDataFetched(addresses.map((address) => address.hash)))

      dispatch(loadingFinished())
    } else {
      rejectWithValue('Could not restore addresses from metadata')
    }
  }
)

export const mainAddressChanged = createAsyncThunk(
  `${sliceName}/mainAddressChanged`,
  async (payload: Address, { getState, dispatch }) => {
    const newMainAddress = payload

    dispatch(loadingStarted())

    const state = getState() as RootState
    const mainAddress = state.addresses.entities[state.addresses.mainAddress]

    if (mainAddress && mainAddress.hash === newMainAddress.hash) {
      throw 'Main address is already set to this address'
    }

    const activeWalletMetadataId = state.activeWallet.metadataId

    if (activeWalletMetadataId) {
      if (mainAddress) {
        await storeAddressMetadata(activeWalletMetadataId, {
          index: mainAddress.index,
          ...mainAddress.settings,
          isMain: false
        })
      }
      await storeAddressMetadata(activeWalletMetadataId, {
        index: newMainAddress.index,
        ...newMainAddress.settings,
        isMain: true
      })
    }

    dispatch(loadingFinished())

    return newMainAddress
  }
)

const findNextAvailableAddressIndex = (startIndex: number, skipIndexes: number[] = []) => {
  let nextAvailableAddressIndex = startIndex

  do {
    nextAvailableAddressIndex++
  } while (skipIndexes.includes(nextAvailableAddressIndex))

  return nextAvailableAddressIndex
}

const findMaxIndexBeforeFirstGap = (indexes: number[]) => {
  let maxIndexBeforeFirstGap = indexes[0]

  for (let index = indexes[1]; index < indexes.length; index++) {
    if (index - maxIndexBeforeFirstGap > 1) {
      break
    } else {
      maxIndexBeforeFirstGap = index
    }
  }

  return maxIndexBeforeFirstGap
}

type AddressIndex = Address['index']

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

export const activeAddressesDiscovered = createAsyncThunk(
  `${sliceName}/activeAddressesDiscovered`,
  async (_, { getState, dispatch }) => {
    dispatch(addressDiscoveryStarted())

    const minGap = 5
    const state = getState() as RootState
    await sleep(1) // Allow execution to continue to not block rendering
    const { masterKey } = await walletImportAsyncUnsafe(mnemonicToSeed, state.activeWallet.mnemonic)
    const addresses = selectAllAddresses(state)
    const activeAddressIndexes: AddressIndex[] = addresses.map((address) => address.index)
    const groupsData = initializeAddressDiscoveryGroupsData(addresses)
    const derivedDataCache = new Map<AddressIndex, AddressAndKeys & { group: number }>()

    let group = 0
    let checkedIndexes = Array.from(activeAddressIndexes)
    let maxIndexBeforeFirstGap = findMaxIndexBeforeFirstGap(activeAddressIndexes)

    try {
      while (group < 4) {
        const groupData = groupsData[group]
        let newAddressGroup: number | undefined = undefined
        let index = groupData.highestIndex ?? maxIndexBeforeFirstGap
        let newAddressData: AddressAndKeys | undefined = undefined

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
            newAddressGroup = addressToGroup(newAddressData.address, TOTAL_NUMBER_OF_GROUPS)
            derivedDataCache.set(index, { ...newAddressData, group: newAddressGroup })
          }
        }

        if (!newAddressData) {
          continue
        }

        groupData.highestIndex = newAddressData.addressIndex

        const { data } = await client.explorerClient.addressesActive.postAddressesActive([newAddressData.address])
        const addressIsActive = data.length > 0 && data[0]

        if (addressIsActive) {
          groupData.gap = 0
          activeAddressIndexes.push(newAddressData.addressIndex)
          maxIndexBeforeFirstGap = findMaxIndexBeforeFirstGap(activeAddressIndexes)
          dispatch(addressDiscovered(newAddressData))
        } else {
          groupData.gap += 1
        }

        if (groupData.gap === minGap) {
          group += 1
          checkedIndexes = Array.from(activeAddressIndexes)
        }

        const state = getState() as RootState
        if (!state.addresses.addressDiscoveryLoading) {
          break
        }
      }
    } catch (e) {
      console.error(e)
    }

    dispatch(addressDiscoveryFinished())
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
        const previousMainAddress = state.entities[state.mainAddress]
        if (previousMainAddress) {
          previousMainAddress.settings.isMain = false
        }

        state.mainAddress = newMainAddress.hash
      }

      addressesAdapter.addMany(
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
              loadedPage: 0,
              allPagesLoaded: false
            },
            availableBalance: '0',
            lockedBalance: '0',
            lastUsed: 0,
            tokens: []
          }
        }))
      )
    },
    addPendingTransactionToAddress: (state, action: PayloadAction<PendingTransaction>) => {
      const pendingTransaction = action.payload

      const address = state.entities[pendingTransaction.fromAddress]
      if (!address) return

      address.networkData.transactions.pending.push(pendingTransaction)
    },
    addressSettingsUpdated: (state, action: PayloadAction<{ hash: AddressHash; settings: AddressSettings }>) => {
      const { hash, settings } = action.payload
      const address = state.entities[hash]
      if (address) {
        address.settings = settings
      }
    },
    addressesFlushed: (state) => {
      addressesAdapter.setAll(state, [])
    },
    loadingStarted: (state) => {
      state.loading = true
    },
    loadingFinished: (state) => {
      state.loading = false
    },
    addressDiscoveryStarted: (state) => {
      state.addressDiscoveryLoading = true
    },
    addressDiscoveryFinished: (state) => {
      state.addressDiscoveryLoading = false
    },
    addressDiscovered: (state, action: PayloadAction<AddressAndKeys>) => {
      state.discoveredAddresses.push(action.payload)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addressesDataFetched.fulfilled, (state, action) => {
        for (const address of action.payload) {
          const { hash, details, availableBalance, transactions, tokens } = address
          const addressState = state.entities[hash]

          if (addressState) {
            const networkData = addressState.networkData
            networkData.details = details
            networkData.tokens = tokens
            if (availableBalance) networkData.availableBalance = availableBalance

            const newTxs = extractNewTransactions(transactions, networkData.transactions.confirmed)

            if (newTxs.length > 0) {
              networkData.transactions.confirmed = [...newTxs.concat(networkData.transactions.confirmed)]

              if (networkData.transactions.loadedPage === 0) {
                networkData.transactions.loadedPage = 1
              }

              networkData.transactions.pending = extractRemainingPendingTransactions(
                networkData.transactions.pending,
                newTxs
              )
            }
          }
        }

        state.status = 'initialized'
      })
      .addCase(fetchAddressesTransactionsNextPage.fulfilled, (state, action) => {
        for (const address of action.payload) {
          const { hash, transactions, page } = address
          const addressState = state.entities[hash]

          if (addressState) {
            const networkData = addressState.networkData
            const newTxs = extractNewTransactions(transactions, networkData.transactions.confirmed)

            if (newTxs.length > 0) {
              networkData.transactions.confirmed = [...networkData.transactions.confirmed.concat(newTxs)]
              networkData.transactions.loadedPage = page
            } else {
              networkData.transactions.allPagesLoaded = true
            }
          }
        }
      })
      .addCase(mainAddressChanged.fulfilled, (state, action) => {
        const newMainAddress = action.payload

        const previousMainAddress = state.entities[state.mainAddress]
        addressesAdapter.updateOne(state, {
          id: state.mainAddress,
          changes: { settings: { ...previousMainAddress?.settings, isMain: false } }
        })

        state.mainAddress = newMainAddress.hash

        addressesAdapter.updateOne(state, {
          id: newMainAddress.hash,
          changes: { settings: { ...newMainAddress.settings, isMain: true } }
        })
      })
  }
})

export const {
  selectById: selectAddressByHash,
  selectAll: selectAllAddresses,
  selectIds: selectAddressIds
} = addressesAdapter.getSelectors<RootState>((state) => state[sliceName])

export const selectMultipleAddresses = createSelector(
  [selectAllAddresses, (state, addressHashes: AddressHash[]) => addressHashes],
  (addresses, addressHashes) => addresses.filter((address) => addressHashes.includes(address.hash))
)

export const selectConfirmedTransactions = createSelector(
  [selectAllAddresses, (state, addressHashes: AddressHash[]) => addressHashes],
  (addresses, addressHashes) =>
    addresses
      .filter((address) => addressHashes.includes(address.hash))
      .map((address) => address.networkData.transactions.confirmed.map((tx) => ({ ...tx, address })))
      .flat()
      .sort((a, b) => {
        const delta = b.timestamp - a.timestamp
        return delta == 0 ? -1 : delta
      })
)

export const selectPendingTransactions = createSelector(
  [selectAllAddresses, (state, addressHashes: AddressHash[]) => addressHashes],
  (addresses, addressHashes) =>
    addresses
      .filter((address) => addressHashes.includes(address.hash))
      .map((address) => address.networkData.transactions.pending.map((tx) => ({ ...tx, address })))
      .flat()
      .sort((a, b) => {
        const delta = b.timestamp - a.timestamp
        return delta == 0 ? -1 : delta
      })
)

export const selectTokens = createSelector([(state, addresses: Address[]) => addresses], (addresses) => {
  const resultTokens: AddressToken[] = []

  addresses.forEach((address) => {
    address.networkData.tokens.forEach((token) => {
      const tokenBalances = resultTokens.find((resultToken) => resultToken.id === token.id)?.balances

      if (tokenBalances) {
        tokenBalances.balance = (BigInt(tokenBalances.balance) + BigInt(token.balances.balance)).toString()
        tokenBalances.lockedBalance = (
          BigInt(tokenBalances.lockedBalance) + BigInt(token.balances.lockedBalance)
        ).toString()
      } else {
        resultTokens.push(token)
      }
    })
  })

  return resultTokens
})

export const selectHaveAllPagesLoaded = createSelector([selectAllAddresses], (addresses) =>
  addresses.every((address) => address.networkData.transactions.allPagesLoaded === true)
)

export const {
  addPendingTransactionToAddress,
  addressesAdded,
  addressesFlushed,
  loadingStarted,
  loadingFinished,
  addressSettingsUpdated,
  addressDiscoveryStarted,
  addressDiscoveryFinished,
  addressDiscovered
} = addressesSlice.actions

export default addressesSlice
