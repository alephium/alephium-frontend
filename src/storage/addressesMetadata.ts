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

import AsyncStorage from '@react-native-async-storage/async-storage'

import { AddressMetadata, AddressSettings } from '../types/addresses'

const STORAGE_KEY_SUFFIX = 'addresses-metadata'

export const loadStoredAddressesMetadataOfAccount = async (accountName: string): Promise<AddressMetadata[]> => {
  try {
    // TODO: Remove accountName from the key and use an index instead
    const data = await AsyncStorage.getItem(`${accountName}-${STORAGE_KEY_SUFFIX}`)

    if (data === null) return []

    return JSON.parse(data)
  } catch (e) {
    console.error(e)
    return []
  }
}

export const storeAddressMetadataOfAccount = async (accountName: string, index: number, settings: AddressSettings) => {
  const addressesMetadata = await loadStoredAddressesMetadataOfAccount(accountName)
  const existingAddressMetadata = addressesMetadata.find((data: AddressMetadata) => data.index === index)

  if (!existingAddressMetadata) {
    addressesMetadata.push({
      index,
      ...settings
    })
  } else {
    Object.assign(existingAddressMetadata, settings)
  }
  console.log(`🟠 Storing address index ${index} metadata locally`)
  // TODO: Remove accountName from the key and use an index instead
  await AsyncStorage.setItem(`${accountName}-${STORAGE_KEY_SUFFIX}`, JSON.stringify(addressesMetadata))
}

export const deleteStoredAddressMetadataOfAccount = async (accountName: string) => {
  // TODO: Remove accountName from the key and use an index instead
  await AsyncStorage.removeItem(`${accountName}-${STORAGE_KEY_SUFFIX}`)
}
