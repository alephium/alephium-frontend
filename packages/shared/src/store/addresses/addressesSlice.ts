import { groupOfAddress } from '@alephium/web3'
import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'

import {
  addressDeleted,
  addressesRestoredFromMetadata,
  addressSettingsSaved,
  defaultAddressChanged,
  newAddressesSaved
} from '@/store/addresses/addressesActions'
import { addressesAdapter } from '@/store/addresses/addressesAdapters'
import { addressSettingsSavedReducer, updateOldDefaultAddress } from '@/store/addresses/addressesReducers'
import {
  activeWalletDeleted,
  walletLocked,
  walletSaved,
  walletSwitched,
  walletUnlocked
} from '@/store/wallets/walletActions'
import { Address, AddressBase, AddressesState } from '@/types/addresses'
import { UnlockedWallet } from '@/types/wallets'

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
      .addCase(newAddressesSaved, (state, action) => {
        const addresses = action.payload

        if (addresses.some((address) => address.isDefault)) updateOldDefaultAddress(state)

        addressesAdapter.addMany(state, addresses.map(getDefaultAddressState))
      })
      .addCase(addressesRestoredFromMetadata, (state, action) => {
        const addresses = action.payload

        addressesAdapter.setAll(state, [])
        addressesAdapter.addMany(state, addresses.map(getDefaultAddressState))
      })
      .addCase(addressDeleted, (state, { payload: addressHash }) => {
        addressesAdapter.removeOne(state, addressHash)
      })
      .addCase(walletSaved, (state, action) => addInitialAddress(state, action.payload.initialAddress))
      .addCase(walletUnlocked, addPassphraseInitialAddress)
      .addCase(walletSwitched, (_, action) => addPassphraseInitialAddress({ ...initialState }, action))

    builder.addMatcher(isAnyOf(walletLocked, activeWalletDeleted), () => initialState)
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

const addPassphraseInitialAddress = (state: AddressesState, action: PayloadAction<UnlockedWallet>) => {
  const { wallet, initialAddress } = action.payload

  if (wallet.isPassphraseUsed) {
    addressesAdapter.removeAll(state)

    return addressesAdapter.addOne(state, getDefaultAddressState(initialAddress))
  }
}
