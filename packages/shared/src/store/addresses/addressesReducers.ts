import { PayloadAction } from '@reduxjs/toolkit'

import { addressesAdapter } from '@/store/addresses/addressesAdapters'
import { Address, AddressesState, AddressHash, AddressSettings } from '@/types/addresses'

export const addressSettingsSavedReducer = (
  state: AddressesState,
  action: PayloadAction<{ addressHash: AddressHash; settings: AddressSettings }>
) => {
  const { addressHash, settings } = action.payload

  if (settings.isDefault) updateOldDefaultAddress(state)

  addressesAdapter.updateOne(state, {
    id: addressHash,
    changes: settings
  })
}

export const updateOldDefaultAddress = (state: AddressesState) => {
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

const getAddresses = (state: AddressesState, addressHashes?: AddressHash[]) => {
  const allAddresses = Object.values(state.entities) as Address[]
  return addressHashes ? allAddresses.filter((address) => addressHashes.includes(address.hash)) : allAddresses
}
