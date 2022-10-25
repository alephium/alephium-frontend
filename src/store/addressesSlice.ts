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
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction
} from '@reduxjs/toolkit'

import client from '../api/client'
import { storeAddressMetadata } from '../storage/wallets'
import { AddressHash, AddressSettings } from '../types/addresses'
import { TimeInMs } from '../types/numbers'
import { AddressToken } from '../types/tokens'
import { PendingTransaction } from '../types/transactions'
import { getNewTransactions, getRemainingPendingTransactions } from '../utils/transactions'
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
    lockedBalance: string
    lastUsed: TimeInMs
    tokens: AddressToken[]
  }
}

type AddressPartial = {
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
  status: 'uninitialized' | 'initialized'
}

const initialState: AddressesState = addressesAdapter.getInitialState({
  mainAddress: '',
  loading: false,
  status: 'uninitialized'
})

export const fetchAddressesData = createAsyncThunk(
  `${sliceName}/fetchAddressesData`,
  async (payload: AddressHash[], { dispatch }) => {
    const results = []
    dispatch(loadingStarted())

    const addresses = payload

    for (const addressHash of addresses) {
      const { data } = await client.explorerClient.getAddressDetails(addressHash)
      const availableBalance = data.balance
        ? data.lockedBalance
          ? (BigInt(data.balance) - BigInt(data.lockedBalance)).toString()
          : data.balance
        : undefined

      const page = 1
      console.log(`⬇️ Fetching page ${page} of address confirmed transactions: `, addressHash)
      const { data: transactions } = await client.explorerClient.getAddressTransactions(addressHash, page)

      const { data: tokenIds } = await client.explorerClient.addresses.getAddressesAddressTokens(addressHash)

      const tokens = await Promise.all(
        tokenIds.map((id) =>
          client.explorerClient.addresses.getAddressesAddressTokensTokenIdBalance(addressHash, id).then(({ data }) => ({
            id,
            balances: data
          }))
        )
      )

      results.push({
        hash: addressHash,
        details: data,
        availableBalance: availableBalance,
        transactions,
        tokens,
        page
      })
    }

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

export const fetchAddressConfirmedTransactions = createAsyncThunk(
  `${sliceName}/fetchAddressConfirmedTransactions`,
  async (payload: { hash: AddressHash; page: number }, { dispatch, getState }) => {
    const { hash, page } = payload
    dispatch(loadingStarted())

    console.log(`⬇️ Fetching page ${page} of address confirmed transactions: `, hash)
    const { data } = await client.explorerClient.getAddressTransactions(hash, page)

    dispatch(loadingFinished())

    return {
      hash,
      transactions: data || [],
      page
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
      state.status = 'uninitialized'
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
      .addCase(fetchAddressesData.fulfilled, (state, action) => {
        for (const address of action.payload) {
          const { hash, details, availableBalance, transactions, page, tokens } = address
          const addressState = state.entities[hash]

          if (addressState) {
            const networkData = addressState.networkData
            networkData.details = details
            networkData.tokens = tokens
            if (availableBalance) networkData.availableBalance = availableBalance

            const newTxs = getNewTransactions(transactions, networkData.transactions.confirmed)

            if (newTxs.length > 0) {
              networkData.transactions.confirmed = [...newTxs.concat(networkData.transactions.confirmed)]

              if (networkData.transactions.loadedPage === 0) {
                networkData.transactions.loadedPage = page
              }

              networkData.transactions.pending = getRemainingPendingTransactions(
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
            const newTxs = getNewTransactions(transactions, networkData.transactions.confirmed)

            if (newTxs.length > 0) {
              networkData.transactions.confirmed = [...networkData.transactions.confirmed.concat(newTxs)]
              networkData.transactions.loadedPage = page
            } else {
              networkData.transactions.allPagesLoaded = true
            }
          }
        }
      })
      .addCase(fetchAddressConfirmedTransactions.fulfilled, (state, action) => {
        const { hash, transactions, page } = action.payload

        const addressState = state.entities[hash]
        if (addressState) {
          addressState.networkData.transactions.confirmed = transactions
          addressState.networkData.transactions.loadedPage = page
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
  addressSettingsUpdated
} = addressesSlice.actions

export default addressesSlice
