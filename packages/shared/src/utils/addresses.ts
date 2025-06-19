import { AddressStoredMetadataWithoutHash, AddressStoredMetadataWithHash } from '@/types/addresses'

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
