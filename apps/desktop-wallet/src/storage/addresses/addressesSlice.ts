import {
  Address,
  AddressBase,
  addressesAdapter,
  AddressesState,
  AddressHash,
  addressSettingsSaved,
  addressSettingsSavedReducer,
  customNetworkSettingsSaved,
  networkPresetSwitched,
  updateOldDefaultAddress
} from '@alephium/shared'
import { groupOfAddress } from '@alephium/web3'
import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'

import {
  addressDeleted,
  addressesRestoredFromMetadata,
  defaultAddressChanged,
  newAddressesSaved
} from '@/storage/addresses/addressesActions'
import {
  activeWalletDeleted,
  walletLocked,
  walletSaved,
  walletSwitched,
  walletUnlocked
} from '@/storage/wallets/walletActions'
import { UnlockedWallet } from '@/types/wallet'
import { getInitialAddressSettings } from '@/utils/addresses'

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
      .addCase(networkPresetSwitched, clearAddressesNetworkData)
      .addCase(customNetworkSettingsSaved, clearAddressesNetworkData)

    builder.addMatcher(isAnyOf(walletLocked, activeWalletDeleted), () => initialState)
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
  group: groupOfAddress(address.hash)
})

const clearAddressesNetworkData = (state: AddressesState) => {
  addressesAdapter.updateMany(
    state,
    getAddresses(state).map((address) => ({ id: address.hash, changes: getDefaultAddressState(address) }))
  )
}

const addInitialAddress = (state: AddressesState, address: AddressBase) => {
  addressesAdapter.removeAll(state)
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
