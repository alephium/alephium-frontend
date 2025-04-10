import {
  AddressBase,
  addressSettingsSaved,
  addressSettingsSavedReducer,
  appReset,
  customNetworkSettingsSaved,
  DEPRECATED_Address as Address,
  networkPresetSwitched
} from '@alephium/shared'
import { groupOfAddress } from '@alephium/web3'
import { createSlice, EntityState, isAnyOf, PayloadAction } from '@reduxjs/toolkit'

import { addressMetadataIncludesHash } from '~/persistent-storage/wallet'
import {
  addressDeleted,
  syncAddressesBalances,
  syncAddressesTokens,
  syncLatestTransactions
} from '~/store/addresses/addressesActions'
import { addressesAdapter } from '~/store/addresses/addressesAdaptor'
import {
  appLaunchedWithLastUsedWallet,
  newWalletGenerated,
  walletDeleted,
  walletUnlocked
} from '~/store/wallet/walletActions'
import { getRandomLabelColor } from '~/utils/colors'

const sliceName = 'addresses'

interface AddressesState extends EntityState<Address> {
  status: 'uninitialized' | 'initialized'
  balancesStatus: 'uninitialized' | 'initialized'
}

const initialState: AddressesState = addressesAdapter.getInitialState({
  status: 'uninitialized',
  balancesStatus: 'uninitialized'
})

const addressesSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    addressesImported: (state, action: PayloadAction<AddressBase[]>) => {
      const addresses = action.payload

      const newDefaultAddress = addresses.find((address) => address.isDefault)
      if (newDefaultAddress) updateOldDefaultAddress(state)

      addressesAdapter.addMany(state, addresses.map(getInitialAddressState))
    },
    newAddressGenerated: (state, action: PayloadAction<AddressBase>) => {
      const address = action.payload

      if (address.isDefault) updateOldDefaultAddress(state)

      addressesAdapter.addOne(state, getInitialAddressState(address))
    },
    addressSettingsSaved: (state, action: PayloadAction<AddressBase>) => {
      const address = action.payload

      if (address.isDefault) updateOldDefaultAddress(state)

      addressesAdapter.updateOne(state, {
        id: address.hash,
        changes: address
      })
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addressSettingsSaved, addressSettingsSavedReducer)
      .addCase(newWalletGenerated, (state, action) => {
        const firstWalletAddress = getInitialAddressState({
          ...action.payload.firstAddress,
          isDefault: true,
          color: getRandomLabelColor()
        })

        addressesAdapter.setAll(state, [])
        addressesAdapter.addOne(state, firstWalletAddress)
      })
      .addCase(syncAddressesTokens.fulfilled, (state, action) => {
        const addressData = action.payload
        const updatedAddresses = addressData.map(({ hash, tokenBalances }) => ({
          id: hash,
          changes: {
            tokens: tokenBalances
          }
        }))

        addressesAdapter.updateMany(state, updatedAddresses)
      })
      .addCase(syncAddressesBalances.fulfilled, (state, action) => {
        const addressData = action.payload
        const updatedAddresses = addressData.map(({ hash, balance, lockedBalance }) => ({
          id: hash,
          changes: {
            balance,
            lockedBalance
          }
        }))

        addressesAdapter.updateMany(state, updatedAddresses)
        state.balancesStatus = 'initialized'
      })
      .addCase(syncLatestTransactions.fulfilled, (state, { payload }) => {
        const changes = payload.map(({ hash, newTransactions }) => {
          const existingData = state.entities[hash]

          return {
            id: hash,
            changes: {
              transactions: existingData?.transactions?.concat(newTransactions.map(({ hash }) => hash)),
              lastUsed: newTransactions[0]?.timestamp ?? existingData?.lastUsed
            }
          }
        })

        if (changes.length > 0) addressesAdapter.updateMany(state, changes)

        state.status = 'initialized'
      })
      .addCase(networkPresetSwitched, clearAddressesNetworkData)
      .addCase(customNetworkSettingsSaved, clearAddressesNetworkData)
      .addCase(addressDeleted, (state, { payload: addressHash }) => {
        addressesAdapter.removeOne(state, addressHash)
      })
      .addCase(appReset, () => initialState)
      .addCase(walletDeleted, () => initialState)
    builder.addMatcher(isAnyOf(walletUnlocked, appLaunchedWithLastUsedWallet), (state, { payload: { addresses } }) => {
      const addressesToInitialize = addresses.filter(
        (address) => addressMetadataIncludesHash(address) && !state.entities[address.hash]
      )

      if (addressesToInitialize.length > 0) {
        addressesAdapter.addMany(
          state,
          addressesToInitialize.filter(addressMetadataIncludesHash).map((address) =>
            getInitialAddressState({
              ...address,
              publicKey: '' // TODO: See https://github.com/alephium/alephium-frontend/issues/1317
            })
          )
        )
      }
    })
  }
})

export const { newAddressGenerated, addressesImported } = addressesSlice.actions

export default addressesSlice

const getInitialAddressState = (addressData: AddressBase): Address => ({
  ...addressData,
  group: groupOfAddress(addressData.hash),
  transactions: [],
  allTransactionPagesLoaded: false,
  balance: '0',
  lockedBalance: '0',
  lastUsed: 0,
  tokens: []
})

const getAddresses = (state: AddressesState) => Object.values(state.entities) as Address[]

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
  const reinitializedAddresses = getAddresses(state).map(getInitialAddressState)

  addressesAdapter.updateMany(
    state,
    reinitializedAddresses.map((address) => ({ id: address.hash, changes: address }))
  )
}
