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

import { AddressMetadata, AddressSettings } from '@alephium/shared'

import { PersistentArrayStorage } from '@/storage/persistentArrayStorage'
import { StoredEncryptedWallet } from '@/types/wallet'

interface AddressMetadataStorageStoreProps {
  index: number
  settings: AddressSettings
}

class AddressMetadataStorage extends PersistentArrayStorage<AddressMetadata> {
  deleteOne(walletId: StoredEncryptedWallet['id'], addressIndex: number) {
    const addressesMetadata = this.load(walletId)
    const existingAddressMetadata = addressesMetadata.find((address) => address.index === addressIndex)

    if (!existingAddressMetadata) {
      throw new Error('Could not delete address, address metadata not found.')
    }

    if (existingAddressMetadata.isDefault) {
      throw new Error('The default address should not be deleted.')
    }

    addressesMetadata.splice(addressesMetadata.indexOf(existingAddressMetadata), 1)

    console.log(`🟠 Deleting address metadata with index ${addressIndex}`)

    super.store(walletId, addressesMetadata)
  }

  storeOne(walletId: StoredEncryptedWallet['id'], { index, settings }: AddressMetadataStorageStoreProps) {
    const addressesMetadata = this.load(walletId)
    const existingAddressMetadata = addressesMetadata.find((address) => address.index === index)
    const currentDefaultAddress = addressesMetadata.find((data) => data.isDefault)

    if (!existingAddressMetadata) {
      addressesMetadata.push({
        index,
        ...settings
      })
    } else {
      Object.assign(existingAddressMetadata, settings)
    }

    if (settings.isDefault && currentDefaultAddress && currentDefaultAddress.index !== index) {
      console.log(`🟠 Removing old default address with index ${index}`)

      Object.assign(currentDefaultAddress, {
        ...currentDefaultAddress,
        isDefault: false
      })
    }

    console.log(`🟠 Storing address index ${index} metadata locally`)

    super.store(walletId, addressesMetadata)
  }
}

export const addressMetadataStorage = new AddressMetadataStorage('addresses-metadata')
