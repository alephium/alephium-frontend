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

import {
  AddressHash,
  customNetworkSettingsSaved,
  extractNewTransactions,
  getTransactionsOfAddress,
  networkPresetSwitched,
  syncingAddressDataStarted
} from '@alephium/shared'
import { groupOfAddress } from '@alephium/web3'
import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'
import { uniq } from 'lodash'

import {
  addressDeleted,
  addressesRestoredFromMetadata,
  addressRestorationStarted,
  addressSettingsSaved,
  defaultAddressChanged,
  newAddressesSaved,
  syncAddressesData,
  syncAddressesTransactions,
  syncAddressTransactionsNextPage,
  syncAllAddressesTransactionsNextPage,
  transactionsLoadingStarted
} from '@/storage/addresses/addressesActions'
import { addressesAdapter } from '@/storage/addresses/addressesAdapters'
import { receiveTestnetTokens } from '@/storage/global/globalActions'
import { transactionSent } from '@/storage/transactions/transactionsActions'
import {
  activeWalletDeleted,
  walletLocked,
  walletSaved,
  walletSwitched,
  walletUnlocked
} from '@/storage/wallets/walletActions'
import { Address, AddressBase, AddressesState } from '@/types/addresses'
import { UnlockedWallet } from '@/types/wallet'
import { getInitialAddressSettings } from '@/utils/addresses'

const initialState: AddressesState = addressesAdapter.getInitialState({
  loadingTransactions: false,
  syncingAddressData: false,
  isRestoringAddressesFromMetadata: false,
  status: 'uninitialized'
})

const addressesSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(syncingAddressDataStarted, (state) => {
        state.syncingAddressData = true
        state.loadingTransactions = true
      })
      .addCase(transactionsLoadingStarted, (state) => {
        state.loadingTransactions = true
      })
      .addCase(addressSettingsSaved, (state, action) => {
        const { addressHash, settings } = action.payload

        if (settings.isDefault) updateOldDefaultAddress(state)

        addressesAdapter.updateOne(state, {
          id: addressHash,
          changes: settings
        })
      })
      .addCase(defaultAddressChanged, (state, action) => {
        const address = action.payload

        updateOldDefaultAddress(state)

        addressesAdapter.updateOne(state, {
          id: address.hash,
          changes: {
            isDefault: true
          }
        })
      })
      .addCase(newAddressesSaved, (state, action) => {
        const addresses = action.payload

        if (addresses.some((address) => address.isDefault)) updateOldDefaultAddress(state)

        addressesAdapter.addMany(state, addresses.map(getDefaultAddressState))
      })
      .addCase(addressesRestoredFromMetadata, (state, action) => {
        const addresses = action.payload

        addressesAdapter.setAll(state, [])
        addressesAdapter.addMany(state, addresses.map(getDefaultAddressState))
        state.isRestoringAddressesFromMetadata = false
        state.status = 'uninitialized'
      })
      .addCase(addressRestorationStarted, (state) => {
        state.isRestoringAddressesFromMetadata = true
      })
      .addCase(syncAddressesData.fulfilled, (state, action) => {
        state.status = 'initialized'
        state.syncingAddressData = false
        state.loadingTransactions = false
      })
      .addCase(addressDeleted, (state, { payload: addressHash }) => {
        addressesAdapter.removeOne(state, addressHash)
      })
      .addCase(syncAddressesTransactions.fulfilled, (state, action) => {
        const addressData = action.payload
        const updatedAddresses = addressData.map(({ hash, transactions }) => {
          const address = state.entities[hash]

          // There should not be a case that we try to sync address data without having the address already in our
          // store. If there is no address found in the store, however, it's safer to return an empty changes object.
          if (!address)
            return {
              id: hash,
              changes: {}
            }

          const lastUsed = transactions.length > 0 ? transactions[0].timestamp : address.lastUsed

          return {
            id: hash,
            changes: {
              transactions: uniq([...address.transactions, ...transactions.map((tx) => tx.hash)]),
              transactionsPageLoaded: address.transactionsPageLoaded === 0 ? 1 : address.transactionsPageLoaded,
              lastUsed
            }
          }
        })

        addressesAdapter.updateMany(state, updatedAddresses)

        state.loadingTransactions = false
      })
      .addCase(syncAddressesData.rejected, (state) => {
        state.status = 'initialized'
        state.syncingAddressData = false
        state.loadingTransactions = false
      })
      .addCase(syncAddressesTransactions.rejected, (state) => {
        state.loadingTransactions = false
      })
      .addCase(syncAddressTransactionsNextPage.fulfilled, (state, action) => {
        const addressTransactionsData = action.payload

        if (!addressTransactionsData) return

        const { hash, transactions, page } = addressTransactionsData
        const address = state.entities[hash]

        if (!address) return

        const newTxHashes = extractNewTransactions(transactions, address.transactions).map(({ hash }) => hash)

        addressesAdapter.updateOne(state, {
          id: hash,
          changes: {
            transactions: address.transactions.concat(newTxHashes),
            transactionsPageLoaded: newTxHashes.length > 0 ? page : address.transactionsPageLoaded,
            allTransactionPagesLoaded: transactions.length === 0
          }
        })

        state.loadingTransactions = false
      })
      .addCase(syncAllAddressesTransactionsNextPage.fulfilled, (state, { payload: { transactions } }) => {
        const addresses = getAddresses(state)

        const updatedAddresses = addresses.map((address) => {
          const transactionsOfAddress = getTransactionsOfAddress(transactions, address.hash)
          const newTxHashes = extractNewTransactions(transactionsOfAddress, address.transactions).map(
            ({ hash }) => hash
          )

          return {
            id: address.hash,
            changes: {
              transactions: address.transactions.concat(newTxHashes)
            }
          }
        })

        addressesAdapter.updateMany(state, updatedAddresses)

        state.loadingTransactions = false
      })
      .addCase(walletSaved, (state, action) => addInitialAddress(state, action.payload.initialAddress))
      .addCase(walletUnlocked, addPassphraseInitialAddress)
      .addCase(walletSwitched, (_, action) => addPassphraseInitialAddress({ ...initialState }, action))
      .addCase(walletLocked, () => initialState)
      .addCase(activeWalletDeleted, () => initialState)
      .addCase(networkPresetSwitched, clearAddressesNetworkData)
      .addCase(customNetworkSettingsSaved, clearAddressesNetworkData)

    builder.addMatcher(isAnyOf(transactionSent, receiveTestnetTokens.fulfilled), (state, action) => {
      const pendingTransaction = action.payload
      const fromAddress = state.entities[pendingTransaction.fromAddress] as Address
      const toAddress = state.entities[pendingTransaction.toAddress] as Address

      if (fromAddress) fromAddress.transactions.push(pendingTransaction.hash)
      if (toAddress && toAddress !== fromAddress) toAddress.transactions.push(pendingTransaction.hash)
    })
  }
})

export default addressesSlice

// Reducers helper functions

const getAddresses = (state: AddressesState, addressHashes?: AddressHash[]) => {
  const allAddresses = Object.values(state.entities) as Address[]
  return addressHashes ? allAddresses.filter((address) => addressHashes.includes(address.hash)) : allAddresses
}

const getDefaultAddressState = (address: AddressBase): Address => ({
  ...address,
  group: groupOfAddress(address.hash),
  transactions: [],
  transactionsPageLoaded: 0,
  allTransactionPagesLoaded: false,
  lastUsed: 0
})

const updateOldDefaultAddress = (state: AddressesState) => {
  const oldDefaultAddress = getAddresses(state).find((address) => address.isDefault)

  if (oldDefaultAddress) {
    addressesAdapter.updateOne(state, {
      id: oldDefaultAddress.hash,
      changes: {
        isDefault: false
      }
    })
  }
}

const clearAddressesNetworkData = (state: AddressesState) => {
  addressesAdapter.updateMany(
    state,
    getAddresses(state).map((address) => ({ id: address.hash, changes: getDefaultAddressState(address) }))
  )

  state.status = 'uninitialized'
}

const addInitialAddress = (state: AddressesState, address: AddressBase) => {
  addressesAdapter.removeAll(state)
  state.status = 'uninitialized'
  return addressesAdapter.addOne(state, getDefaultAddressState(address))
}

const addPassphraseInitialAddress = (state: AddressesState, action: PayloadAction<UnlockedWallet>) => {
  const { wallet, initialAddress } = action.payload

  if (wallet.isPassphraseUsed)
    return addInitialAddress(state, {
      ...initialAddress,
      ...getInitialAddressSettings()
    })
}
