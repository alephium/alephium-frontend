import { KeyType } from '@alephium/web3'

import {
  Address,
  AddressStoredMetadataWithHash,
  AddressStoredMetadataWithoutHash,
  GrouplessAddress
} from '@/types/addresses'

export const findNextAvailableAddressIndex = (startIndex: number, skipIndexes: number[] = []) => {
  let nextAvailableAddressIndex = startIndex

  do {
    nextAvailableAddressIndex++
  } while (skipIndexes.includes(nextAvailableAddressIndex))

  return nextAvailableAddressIndex
}

export const isAddressIndexValid = (addressIndex: number) =>
  addressIndex >= 0 && Number.isInteger(addressIndex) && !addressIndex.toString().includes('e')

export const addressMetadataIncludesHash = (
  metadata: AddressStoredMetadataWithoutHash | AddressStoredMetadataWithHash
): metadata is AddressStoredMetadataWithHash => (metadata as AddressStoredMetadataWithHash).hash !== undefined

// TODO: Replace by isGrouplessKeyType from web3 when available
export const isGrouplessKeyType = (keyType: KeyType = 'default') =>
  keyType !== 'default' && keyType !== 'bip340-schnorr'

export const isGrouplessAddress = (address: Address): address is GrouplessAddress => isGrouplessKeyType(address.keyType)
