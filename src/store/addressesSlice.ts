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

import { Asset, TokenDisplayBalances } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { addressToGroup, explorer, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction
} from '@reduxjs/toolkit'
import { chunk, uniq } from 'lodash'

import {
  fetchAddressesData,
  fetchAddressesHistoricalBalances,
  fetchAddressesTransactionsNextPage,
  fetchAddressTransactionsNextPage
} from '~/api/addresses'
import { newWalletGenerated, walletSwitched, walletUnlocked } from '~/store/activeWalletSlice'
import { balanceHistoryAdapter } from '~/store/addresses/addressesAdapter'
import { appReset } from '~/store/appSlice'
import { selectAllAssetsInfo } from '~/store/assets/assetsSelectors'
import { customNetworkSettingsSaved, networkPresetSwitched } from '~/store/networkSlice'
import { RootState } from '~/store/store'
import { extractNewTransactionHashes, getTransactionsOfAddress } from '~/store/transactions/transactionUtils'
import { Address, AddressesHistoricalBalanceResult, AddressHash, AddressPartial } from '~/types/addresses'
import { getRandomLabelColor } from '~/utils/colors'

const sliceName = 'addresses'

const addressesAdapter = createEntityAdapter<Address>({
  selectId: (address) => address.hash,
  sortComparer: (a, b) => {
    // Always keep main address to the top of the list
    if (a.settings.isMain) return -1
    if (b.settings.isMain) return 1
    return (b.lastUsed ?? 0) - (a.lastUsed ?? 0)
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

export const syncAddressesData = createAsyncThunk(
  `${sliceName}/syncAddressesData`,
  async (payload: AddressHash | AddressHash[] | undefined, { getState, dispatch }) => {
    dispatch(loadingStarted())

    const state = getState() as RootState
    const addresses =
      payload !== undefined ? (Array.isArray(payload) ? payload : [payload]) : (state.addresses.ids as AddressHash[])
    const results = await fetchAddressesData(addresses)

    return results
  }
)

// TODO: Same as in desktop wallet, share state?
export const syncAddressTransactionsNextPage = createAsyncThunk(
  'addresses/syncAddressTransactionsNextPage',
  async (payload: AddressHash, { getState, dispatch }) => {
    dispatch(loadingStarted())

    const state = getState() as RootState
    const address = selectAddressByHash(state, payload)

    if (!address) return

    return await fetchAddressTransactionsNextPage(address)
  }
)

// TODO: Same as in desktop wallet, share state?
export const syncAllAddressesTransactionsNextPage = createAsyncThunk(
  'addresses/syncAllAddressesTransactionsNextPage',
  async (_, { getState, dispatch }): Promise<{ pageLoaded: number; transactions: explorer.Transaction[] }> => {
    dispatch(loadingStarted())

    const state = getState() as RootState
    const addresses = selectAllAddresses(state)

    let nextPageToLoad = state.confirmedTransactions.pageLoaded + 1
    let newTransactionsFound = false
    let transactions: explorer.Transaction[] = []

    while (!newTransactionsFound) {
      // NOTE: Explorer backend limits this query to 80 addresses
      const results = await Promise.all(
        chunk(addresses, 80).map((addressesChunk) => fetchAddressesTransactionsNextPage(addressesChunk, nextPageToLoad))
      )

      transactions = results.flat()

      if (transactions.length === 0) break

      newTransactionsFound = addresses.some((address) => {
        const transactionsOfAddress = getTransactionsOfAddress(transactions, address)
        const newTxHashes = extractNewTransactionHashes(transactionsOfAddress, address.transactions)

        return newTxHashes.length > 0
      })

      nextPageToLoad += 1
    }

    return { pageLoaded: nextPageToLoad - 1, transactions }
  }
)

// TODO: Same as in desktop wallet, share state?
export const syncAddressesHistoricBalances = createAsyncThunk(
  'addresses/syncAddressesHistoricBalances',
  async (payload: AddressHash | AddressHash[] | undefined, { getState }): Promise<AddressesHistoricalBalanceResult> => {
    const state = getState() as RootState

    const addresses =
      payload !== undefined ? (Array.isArray(payload) ? payload : [payload]) : (state.addresses.ids as AddressHash[])
    return await fetchAddressesHistoricalBalances(addresses)
  }
)

const addressesSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    addressesImported: (state, action: PayloadAction<AddressPartial[]>) => {
      const addresses = action.payload

      const newDefaultAddress = addresses.find((address) => address.settings?.isMain)
      if (newDefaultAddress) updateOldDefaultAddress(state)

      addressesAdapter.addMany(state, addresses.map(getInitialAddressState))
    },
    newAddressGenerated: (state, action: PayloadAction<AddressPartial>) => {
      const address = action.payload

      if (address.settings.isMain) updateOldDefaultAddress(state)

      addressesAdapter.addOne(state, getInitialAddressState(address))
    },
    defaultAddressChanged: (state, action: PayloadAction<Address>) => {
      const address = action.payload

      updateOldDefaultAddress(state)

      addressesAdapter.updateOne(state, {
        id: address.hash,
        changes: { settings: { ...address.settings, isMain: true } }
      })
    },
    addressSettingsSaved: (state, action: PayloadAction<AddressPartial>) => {
      const address = action.payload

      if (address.settings.isMain) updateOldDefaultAddress(state)

      addressesAdapter.updateOne(state, {
        id: address.hash,
        changes: { settings: address.settings }
      })
    },
    transactionSent: (state, action) => {
      const pendingTransaction = action.payload
      const address = state.entities[pendingTransaction.fromAddress] as Address

      address.transactions.push(pendingTransaction.hash)
    },
    loadingStarted: (state) => {
      state.loading = true
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(walletSwitched, (state, action) => {
        addressesAdapter.setAll(state, [])
        addressesAdapter.addMany(state, action.payload.addressesToInitialize.map(getInitialAddressState))
        state.status = 'uninitialized'
      })
      .addCase(walletUnlocked, (state, action) => {
        const { addressesToInitialize } = action.payload

        if (addressesToInitialize.length > 0) {
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
      .addCase(syncAddressesData.fulfilled, (state, action) => {
        const addressData = action.payload
        const updatedAddresses = addressData.map(({ hash, details, tokens, transactions }) => {
          const address = state.entities[hash] as Address

          return {
            id: hash,
            changes: {
              ...details,
              tokens,
              transactions: uniq(address.transactions.concat(transactions.map((tx) => tx.hash))),
              transactionsPageLoaded: address.transactionsPageLoaded === 0 ? 1 : address.transactionsPageLoaded,
              lastUsed: transactions.length > 0 ? transactions[0].timestamp : address.lastUsed
            }
          }
        })

        addressesAdapter.updateMany(state, updatedAddresses)

        state.status = 'initialized'
        state.loading = false
      })
      .addCase(syncAddressTransactionsNextPage.fulfilled, (state, action) => {
        const addressTransactionsData = action.payload

        if (!addressTransactionsData) return

        const { hash, transactions, page } = addressTransactionsData
        const address = state.entities[hash] as Address
        const newTxHashes = extractNewTransactionHashes(transactions, address.transactions)

        addressesAdapter.updateOne(state, {
          id: hash,
          changes: {
            transactions: address.transactions.concat(newTxHashes),
            transactionsPageLoaded: newTxHashes.length > 0 ? page : address.transactionsPageLoaded,
            allTransactionPagesLoaded: transactions.length === 0
          }
        })

        state.loading = false
      })
      .addCase(syncAllAddressesTransactionsNextPage.fulfilled, (state, { payload: { transactions } }) => {
        const addresses = getAddresses(state)

        const updatedAddresses = addresses.map((address) => {
          const transactionsOfAddress = getTransactionsOfAddress(transactions, address)
          const newTxHashes = extractNewTransactionHashes(transactionsOfAddress, address.transactions)

          return {
            id: address.hash,
            changes: {
              transactions: address.transactions.concat(newTxHashes),
              allTransactionPagesLoaded: transactions.length === 0
            }
          }
        })

        addressesAdapter.updateMany(state, updatedAddresses)

        state.loading = false
      })
      .addCase(networkPresetSwitched, clearAddressesNetworkData)
      .addCase(customNetworkSettingsSaved, clearAddressesNetworkData)
      .addCase(appReset, () => initialState)
      .addCase(syncAddressesHistoricBalances.fulfilled, (state, { payload: data }) => {
        data.forEach(({ address, balances }) => {
          const addressState = state.entities[address]

          if (addressState) {
            balanceHistoryAdapter.upsertMany(addressState.balanceHistory, balances)
            addressState.balanceHistoryInitialized = true
          }
        })
      })
  }
})

export const {
  selectById: selectAddressByHash,
  selectAll: selectAllAddresses,
  selectIds: selectAddressIds
} = addressesAdapter.getSelectors<RootState>((state) => state[sliceName])

// TODO: Same as in desktop wallet
export const makeSelectAddressesAssets = () =>
  createSelector(
    [selectAllAssetsInfo, makeSelectAddressesAlphAsset(), makeSelectAddresses()],
    (assetsInfo, alphAsset, addresses): Asset[] => {
      const tokenBalances = addresses.reduce((acc, { tokens }) => {
        tokens.forEach((token) => {
          const existingToken = acc.find((t) => t.id === token.id)

          if (!existingToken) {
            acc.push({
              id: token.id,
              balance: BigInt(token.balance),
              lockedBalance: BigInt(token.lockedBalance)
            })
          } else {
            existingToken.balance = existingToken.balance + BigInt(token.balance)
            existingToken.lockedBalance = existingToken.lockedBalance + BigInt(token.lockedBalance)
          }
        })

        return acc
      }, [] as TokenDisplayBalances[])

      const tokenAssets = tokenBalances.map((token) => {
        const assetInfo = assetsInfo.find((t) => t.id === token.id)

        return {
          id: token.id,
          balance: BigInt(token.balance.toString()),
          lockedBalance: BigInt(token.lockedBalance.toString()),
          name: assetInfo?.name,
          symbol: assetInfo?.symbol,
          description: assetInfo?.description,
          logoURI: assetInfo?.logoURI,
          decimals: assetInfo?.decimals ?? 0
        }
      })

      return [alphAsset, ...tokenAssets]
    }
  )

// TODO: Same as in desktop wallet
export const makeSelectAddressesAlphAsset = () =>
  createSelector(makeSelectAddresses(), (addresses): Asset => {
    const alphBalances = addresses.reduce(
      (acc, { balance, lockedBalance }) => ({
        balance: acc.balance + BigInt(balance),
        lockedBalance: acc.lockedBalance + BigInt(lockedBalance)
      }),
      { balance: BigInt(0), lockedBalance: BigInt(0) }
    )

    return {
      ...ALPH,
      ...alphBalances
    }
  })

// TODO: Same as in desktop wallet
export const makeSelectAddresses = () =>
  createSelector(
    [selectAllAddresses, (_, addressHashes?: AddressHash[] | AddressHash) => addressHashes],
    (allAddresses, addressHashes) =>
      addressHashes
        ? allAddresses.filter((address) =>
            Array.isArray(addressHashes) ? addressHashes.includes(address.hash) : addressHashes === address.hash
          )
        : allAddresses
  )

export const selectDefaultAddress = createSelector(selectAllAddresses, (addresses) =>
  addresses.find((address) => address.settings.isMain)
)

export const selectTotalBalance = createSelector([selectAllAddresses], (addresses) =>
  addresses.reduce((acc, address) => acc + BigInt(address.balance), BigInt(0))
)

export const {
  newAddressGenerated,
  addressesImported,
  defaultAddressChanged,
  addressSettingsSaved,
  transactionSent,
  loadingStarted
} = addressesSlice.actions

export default addressesSlice

const getInitialAddressState = (addressData: AddressPartial): Address => ({
  ...addressData,
  settings: addressData.settings || {
    isMain: false,
    color: getRandomLabelColor()
  },
  group: addressToGroup(addressData.hash, TOTAL_NUMBER_OF_GROUPS),
  transactions: [],
  transactionsPageLoaded: 0,
  allTransactionPagesLoaded: false,
  balance: '0',
  lockedBalance: '0',
  txNumber: 0,
  lastUsed: 0,
  tokens: [],
  balanceHistory: balanceHistoryAdapter.getInitialState(),
  balanceHistoryInitialized: false
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

const clearAddressesNetworkData = (state: AddressesState) => {
  const reinitializedAddresses = getAddresses(state).map(getInitialAddressState)

  addressesAdapter.updateMany(
    state,
    reinitializedAddresses.map((address) => ({ id: address.hash, changes: address }))
  )

  state.status = 'uninitialized'
}
