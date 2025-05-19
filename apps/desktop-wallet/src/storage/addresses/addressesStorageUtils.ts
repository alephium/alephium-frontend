import { Address, AddressBase, AddressSettings, addressSettingsSaved } from '@alephium/shared'

import { defaultAddressChanged, newAddressesSaved } from '@/storage/addresses/addressesActions'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { store } from '@/storage/store'

export const saveNewAddresses = (addresses: AddressBase[]) => {
  const { id: walletId, isPassphraseUsed } = store.getState().activeWallet

  if (!walletId) throw new Error('Could not save address, wallet ID not found')

  if (!isPassphraseUsed)
    addresses.forEach((address) =>
      addressMetadataStorage.storeOne(walletId, {
        index: address.index,
        settings: {
          isDefault: address.isDefault,
          label: address.label,
          color: address.color
        }
      })
    )

  store.dispatch(newAddressesSaved(addresses))
}

export const changeDefaultAddress = (address: Address) => {
  const { id: walletId, isPassphraseUsed } = store.getState().activeWallet

  if (!walletId) throw new Error('Could not change default address, wallet ID not found')

  if (!isPassphraseUsed)
    addressMetadataStorage.storeOne(walletId, {
      index: address.index,
      settings: {
        isDefault: true,
        label: address.label,
        color: address.color
      }
    })

  store.dispatch(defaultAddressChanged(address))
}

export const saveAddressSettings = (address: AddressBase, settings: AddressSettings) => {
  const { id: walletId, isPassphraseUsed } = store.getState().activeWallet

  if (!walletId) throw new Error('Could not save address settings, wallet ID not found')

  if (!isPassphraseUsed) addressMetadataStorage.storeOne(walletId, { index: address.index, settings })

  store.dispatch(addressSettingsSaved({ addressHash: address.hash, settings }))
}
