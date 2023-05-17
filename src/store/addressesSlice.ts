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

import { addressToGroup, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction
} from '@reduxjs/toolkit'
import { uniq } from 'lodash'

import { fetchAddressesData, fetchAddressTransactionsNextPage } from '../api/addresses'
import { Address, AddressHash, AddressPartial } from '../types/addresses'
import { AddressToken } from '../types/tokens'
import { getRandomLabelColor } from '../utils/colors'
import { extractNewTransactionHashes } from '../utils/transactions'
import { newWalletGenerated, walletSwitched, walletUnlocked } from './activeWalletSlice'
import { appReset } from './appSlice'
import { customNetworkSettingsSaved, networkPresetSwitched } from './networkSlice'
import { RootState } from './store'

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
  async (payload: AddressHash[] | undefined, { getState, dispatch }) => {
    dispatch(loadingStarted())

    const state = getState() as RootState
    const addresses = payload ?? (state.addresses.ids as AddressHash[])
    const results = await fetchAddressesData(addresses)

    return results
  }
)

export const syncAddressesTransactionsNextPage = createAsyncThunk(
  `${sliceName}/syncAddressesTransactionsNextPage`,
  async (payload: AddressHash[] | undefined, { getState, dispatch }) => {
    dispatch(loadingStarted())

    const state = getState() as RootState
    const allAddresses = selectAllAddresses(state)
    const addresses = payload ? allAddresses.filter((address) => payload.includes(address.hash)) : allAddresses

    return await Promise.all(addresses.map((address) => fetchAddressTransactionsNextPage(address)))
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
              ...tokens,
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
      .addCase(syncAddressesTransactionsNextPage.fulfilled, (state, action) => {
        const addressData = action.payload
        const updatedAddresses = addressData.map(({ hash, transactions, page }) => {
          const address = state.entities[hash] as Address
          const newTxHashes = extractNewTransactionHashes(transactions, address.transactions)

          return {
            id: hash,
            changes: {
              transactions: address.transactions.concat(newTxHashes),
              transactionsPageLoaded: newTxHashes.length > 0 ? page : address.transactionsPageLoaded,
              allTransactionPagesLoaded: newTxHashes.length === 0
            }
          }
        })

        addressesAdapter.updateMany(state, updatedAddresses)

        state.loading = false
      })
      .addCase(networkPresetSwitched, clearAddressesNetworkData)
      .addCase(customNetworkSettingsSaved, clearAddressesNetworkData)
      .addCase(appReset, () => initialState)
  }
})

export const {
  selectById: selectAddressByHash,
  selectAll: selectAllAddresses,
  selectIds: selectAddressIds
} = addressesAdapter.getSelectors<RootState>((state) => state[sliceName])

export const selectTokens = createSelector([(state, addresses: Address[]) => addresses], (addresses) => {
  const resultTokens: AddressToken[] = []

  addresses.forEach((address) => {
    address.tokens.forEach((token) => {
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
  addresses.every((address) => address.allTransactionPagesLoaded)
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
  tokens: []
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
