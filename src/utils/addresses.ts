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

import * as Clipboard from 'expo-clipboard'
import Toast from 'react-native-root-toast'

import { storeAddressMetadata } from '../storage/wallets'
import { Address, AddressHash, AddressPartial, AddressSettings } from '../types/addresses'

export const getAddressDisplayName = (address: Address): string =>
  address.settings.label || address.hash.substring(0, 6)

export const copyAddressToClipboard = (addressHash: AddressHash) => {
  Clipboard.setString(addressHash)
  Toast.show('Address copied!')
}

export const findNextAvailableAddressIndex = (startIndex: number, skipIndexes: number[] = []) => {
  let nextAvailableAddressIndex = startIndex

  do {
    nextAvailableAddressIndex++
  } while (skipIndexes.includes(nextAvailableAddressIndex))

  return nextAvailableAddressIndex
}

export const findMaxIndexBeforeFirstGap = (indexes: number[]) => {
  let maxIndexBeforeFirstGap = indexes[0]

  for (let index = indexes[1]; index < indexes.length; index++) {
    if (index - maxIndexBeforeFirstGap > 1) {
      break
    } else {
      maxIndexBeforeFirstGap = index
    }
  }

  return maxIndexBeforeFirstGap
}

export const storeAddressSettings = async (
  address: AddressPartial,
  settings: AddressSettings,
  metadataId: string,
  oldDefaultAddress?: Address
) => {
  await storeAddressMetadata(metadataId, { index: address.index, ...settings })

  if (settings.isMain && oldDefaultAddress && oldDefaultAddress.hash !== address.hash) {
    await storeAddressMetadata(metadataId, {
      index: oldDefaultAddress.index,
      ...oldDefaultAddress.settings,
      isMain: false
    })
  }
}
