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
import { Transaction } from '@alephium/sdk/api/explorer'
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction
} from '@reduxjs/toolkit'

import client from '../api/client'
import { deriveAddressesFromStoredMetadata } from '../storage/wallets'
import { Address, AddressHash, AddressPartial, AddressSettings } from '../types/addresses'
import { AddressToken } from '../types/tokens'
import { PendingTransaction } from '../types/transactions'
import { storeAddressSettings } from '../utils/addresses'
import { getRandomLabelColor } from '../utils/colors'
import { extractNewTransactions, extractRemainingPendingTransactions } from '../utils/transactions'
import { appReset } from './actions'
import { newWalletGenerated, walletUnlocked } from './activeWalletSlice'
import { customNetworkSettingsStored } from './networkSlice'
import { RootState } from './store'

const sliceName = 'addresses'

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
  loading: boolean
  status: 'uninitialized' | 'initialized'
}

const initialState: AddressesState = addressesAdapter.getInitialState({
  loading: false,
  status: 'uninitialized'
})

export const fetchAddressesData = createAsyncThunk(
  `${sliceName}/fetchAddressesData`,
  async (payload: AddressHash[] | undefined, { getState, dispatch }) => {
    dispatch(loadingStarted())

    const state = getState() as RootState
    const addresses = payload ?? (state.addresses.ids as AddressHash[])
    const results = await client.fetchAddressesData(addresses)

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

    return results
  }
)

export const initializeAddressesFromStoredMetadata = createAsyncThunk(
  `${sliceName}/initializeAddressesFromStoredMetadata`,
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as RootState

    const { metadataId, mnemonic } = state.activeWallet

    if (metadataId && mnemonic) {
      dispatch(loadingStarted())

      const addresses = await deriveAddressesFromStoredMetadata(metadataId, mnemonic)

      dispatch(addressesAdded(addresses))
      await dispatch(fetchAddressesData(addresses.map((address) => address.hash)))

      dispatch(loadingFinished())
    } else {
      rejectWithValue('Could not restore addresses from metadata')
    }
  }
)

export const newAddressesStoredAndInitialized = createAsyncThunk(
  `${sliceName}/newAddressesStoredAndInitialized`,
  async (payload: AddressPartial[], { getState, dispatch }) => {
    const newAddresses = payload
    const state = getState() as RootState
    const { metadataId } = state.activeWallet
    const oldDefaultAddress = selectDefaultAddress(state)

    for (const newAddress of newAddresses) {
      await storeAddressSettings(newAddress, newAddress.settings, metadataId, oldDefaultAddress)
    }

    dispatch(addressesAdded(newAddresses))
    await dispatch(fetchAddressesData(newAddresses.map((address) => address.hash)))
  }
)

export const updateAddressSettings = createAsyncThunk(
  `${sliceName}/updateAddressSettings`,
  async (payload: { address: Address; settings: AddressSettings }, { getState }) => {
    const { address, settings } = payload
    const state = getState() as RootState
    const { metadataId } = state.activeWallet
    const oldDefaultAddress = selectDefaultAddress(state)

    await storeAddressSettings(address, settings, metadataId, oldDefaultAddress)

    return {
      address,
      settings
    }
  }
)

const getInitialAddressState = (addressData: AddressPartial) => ({
  ...addressData,
  settings: addressData.settings || {
    isMain: false,
    color: getRandomLabelColor()
  },
  group: addressToGroup(addressData.hash, TOTAL_NUMBER_OF_GROUPS),
  // 🚨 Anti-pattern: deeply nested store.
  // TODO: Make it flatter?
  networkData: {
    details: {
      balance: '0',
      lockedBalance: '0',
      txNumber: 0
    },
    // 🚨 Anti-pattern: state duplication.
    // Transactions can be repeated amonst different addresses.
    // TODO: Move to its own slice?
    transactions: {
      confirmed: [],
      pending: [],
      loadedPage: 0,
      allPagesLoaded: false
    },
    availableBalance: '0',
    // 🚨 Anti-pattern: implicit state duplication.
    // This value could be derived using a transactions selector.
    // Also, this value is never properly initialized.
    // TODO: Remove and create a selector?
    lastUsed: 0,
    tokens: []
  }
})

const getAddresses = (state: AddressesState) => Object.values(state.entities) as Address[]

const updateOldDefaultAddress = (state: AddressesState) => {
  const oldDefaultAddress = getAddresses(state).find((address) => address.settings.isMain)

  if (oldDefaultAddress) {
    addressesAdapter.updateOne(state, {
      id: oldDefaultAddress.hash,
      changes: { settings: { ...oldDefaultAddress.settings, isMain: false } }
    })
  }
}

const addressesSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    addressesAdded: (state, action: PayloadAction<AddressPartial[]>) => {
      const addresses = action.payload

      const newDefaultAddress = addresses.find((address) => address.settings?.isMain)
      if (newDefaultAddress) updateOldDefaultAddress(state)

      addressesAdapter.addMany(state, addresses.map(getInitialAddressState))
    },
    addPendingTransactionToAddress: (state, action: PayloadAction<PendingTransaction>) => {
      const pendingTransaction = action.payload

      const address = state.entities[pendingTransaction.fromAddress]
      if (!address) return

      address.networkData.transactions.pending.push(pendingTransaction)
    },
    addressesFlushed: (state) => {
      addressesAdapter.setAll(state, [])
    },
    loadingStarted: (state) => {
      state.loading = true
    },
    loadingFinished: (state) => {
      state.loading = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(walletUnlocked, (state, action) => {
        const { addressesToInitialize } = action.payload

        if (addressesToInitialize && addressesToInitialize.length > 0) {
          addressesAdapter.setAll(state, [])
          addressesAdapter.addMany(state, addressesToInitialize.map(getInitialAddressState))
          state.status = 'uninitialized'
        }
      })
      .addCase(newWalletGenerated, (state, action) => {
        const firstWalletAddress = getInitialAddressState({
          ...action.payload.firstAddress,
          settings: {
            isMain: true,
            color: getRandomLabelColor()
          }
        })

        addressesAdapter.setAll(state, [])
        addressesAdapter.addOne(state, firstWalletAddress)
      })
      .addCase(fetchAddressesData.fulfilled, (state, action) => {
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
        state.loading = false
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

        state.loading = false
      })
      .addCase(updateAddressSettings.fulfilled, (state, action) => {
        const { address, settings } = action.payload

        addressesAdapter.updateOne(state, {
          id: address.hash,
          changes: { settings }
        })

        if (settings.isMain) updateOldDefaultAddress(state)
      })
      .addCase(customNetworkSettingsStored, (state) => {
        const reinitializedAddresses = getAddresses(state).map(getInitialAddressState)

        addressesAdapter.updateMany(
          state,
          reinitializedAddresses.map((address) => ({
            id: address.hash,
            changes: { networkData: address.networkData }
          }))
        )

        state.status = 'uninitialized'
      })
      .addCase(appReset, () => initialState)
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

export const selectHaveAllPagesLoaded = createSelector(selectAllAddresses, (addresses) =>
  addresses.every((address) => address.networkData.transactions.allPagesLoaded === true)
)

export const selectDefaultAddress = createSelector(selectAllAddresses, (addresses) =>
  addresses.find((address) => address.settings.isMain)
)

export const { addPendingTransactionToAddress, addressesAdded, addressesFlushed, loadingStarted, loadingFinished } =
  addressesSlice.actions

export default addressesSlice
