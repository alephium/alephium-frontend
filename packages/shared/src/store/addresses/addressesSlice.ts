import { groupOfAddress } from '@alephium/web3'
import { createSlice, isAnyOf } from '@reduxjs/toolkit'

import {
  addressDeleted,
  addressesImported,
  addressesRestoredFromMetadata,
  addressSettingsSaved,
  defaultAddressChanged,
  newAddressesSaved
} from '@/store/addresses/addressesActions'
import { addressesAdapter } from '@/store/addresses/addressesAdapters'
import { addressSettingsSavedReducer, updateOldDefaultAddress } from '@/store/addresses/addressesReducers'
import { appReset } from '@/store/global'
import {
  activeWalletDeleted,
  appLaunchedWithLastUsedWallet,
  newWalletInitialAddressGenerated,
  passphraseInitialAddressGenerated,
  walletLocked,
  walletUnlockedMobile
} from '@/store/wallets/walletActions'
import { Address, AddressBase, AddressesState } from '@/types/addresses'
import { addressMetadataIncludesHash } from '@/utils/addresses'

const initialState: AddressesState = addressesAdapter.getInitialState()

const addressesSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(addressSettingsSaved, addressSettingsSavedReducer)
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
      .addCase(addressesRestoredFromMetadata, (state, action) => {
        const addresses = action.payload

        addressesAdapter.setAll(state, [])
        addressesAdapter.addMany(state, addresses.map(getDefaultAddressState))
      })
      .addCase(addressDeleted, (state, { payload: addressHash }) => {
        addressesAdapter.removeOne(state, addressHash)
      })

    builder
      .addMatcher(isAnyOf(walletLocked, activeWalletDeleted, appReset), () => initialState)
      .addMatcher(isAnyOf(newWalletInitialAddressGenerated, passphraseInitialAddressGenerated), (state, action) =>
        addInitialAddress(state, action.payload)
      )
      .addMatcher(isAnyOf(addressesImported, newAddressesSaved), (state, action) => {
        const addresses = action.payload

        if (addresses.some((address) => address.isDefault)) updateOldDefaultAddress(state)

        addressesAdapter.addMany(state, addresses.map(getDefaultAddressState))
      })
      .addMatcher(isAnyOf(walletUnlockedMobile, appLaunchedWithLastUsedWallet), (state, { payload: { addresses } }) => {
        const addressesToInitialize = addresses.filter(
          (address) => addressMetadataIncludesHash(address) && !state.entities[address.hash]
        )

        if (addressesToInitialize.length > 0) {
          addressesAdapter.addMany(
            state,
            addressesToInitialize.filter(addressMetadataIncludesHash).map((address) =>
              getDefaultAddressState({
                ...address,
                publicKey: '' // TODO: See https://github.com/alephium/alephium-frontend/issues/1317
              })
            )
          )
        }
      })
  }
})

export default addressesSlice

// Reducers helper functions

const getDefaultAddressState = (address: AddressBase): Address => ({
  ...address,
  group: groupOfAddress(address.hash)
})

const addInitialAddress = (state: AddressesState, address: AddressBase) => {
  addressesAdapter.removeAll(state)
  return addressesAdapter.addOne(state, getDefaultAddressState(address))
}
