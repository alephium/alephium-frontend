import { AddressHash, customNetworkSettingsSaved, networkPresetSwitched } from '@alephium/shared'
import { groupOfAddress } from '@alephium/web3'
import { createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'

import {
  addressDeleted,
  addressesRestoredFromMetadata,
  addressRestorationStarted,
  addressSettingsSaved,
  defaultAddressChanged,
  newAddressesSaved
} from '@/storage/addresses/addressesActions'
import { addressesAdapter } from '@/storage/addresses/addressesAdapters'
import {
  activeWalletDeleted,
  walletLocked,
  walletSaved,
  walletSwitched,
  walletUnlocked
} from '@/storage/wallets/walletActions'
import { Address, AddressBase, AddressesState, AddressOrder } from '@/types/addresses'
import { UnlockedWallet } from '@/types/wallet'
import { getInitialAddressSettings } from '@/utils/addresses'

const initialState: AddressesState = addressesAdapter.getInitialState({
  orderPreference: {},
  isRestoringAddressesFromMetadata: false
})

const addressesSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    setAddressOrder: (state, action: PayloadAction<{ walletId: string; order: AddressOrder }>) => {
      const { walletId, order } = action.payload
      state.orderPreference[walletId] = order
    }
  },
  extraReducers(builder) {
    builder
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
      })
      .addCase(addressRestorationStarted, (state) => {
        state.isRestoringAddressesFromMetadata = true
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
export const { setAddressOrder } = addressesSlice.actions

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
