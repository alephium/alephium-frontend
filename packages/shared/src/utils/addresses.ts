import { isGrouplessKeyType } from '@alephium/web3'

import {
  Address,
  AddressStoredMetadataWithHash,
  AddressStoredMetadataWithoutHash,
  GrouplessAddress
} from '@/types/addresses'

export const findNextAvailableAddressIndex = (startIndex?: number, skipIndexes: number[] = []): number => {
  if (startIndex === undefined) return 0
  if (startIndex < 0) throw new Error('Start index must be greater than or equal to 0')

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

export const isGrouplessAddress = (address: Address): address is GrouplessAddress => isGrouplessKeyType(address.keyType)

export const getAddressesInGroup = (addresses: Address[], group?: number) =>
  group !== undefined
    ? addresses.filter((address) => isGrouplessAddress(address) || address.group === group)
    : addresses
