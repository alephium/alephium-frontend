import { keyring, NonSensitiveAddressData } from '@alephium/keyring'
import { AddressSettings } from '@alephium/shared'

import { Address } from '@/types/addresses'
import { getRandomLabelColor } from '@/utils/colors'

export const getName = (address: Address): string => address.label || `${address.hash.substring(0, 10)}...`

export const getInitialAddressSettings = (): AddressSettings => ({
  isDefault: true,
  color: getRandomLabelColor()
})

export const deriveAddressesInGroup = (
  group: number,
  amount: number,
  skipIndexes: number[]
): NonSensitiveAddressData[] => {
  const addresses = []
  const skipAddressIndexes = Array.from(skipIndexes)

  for (let j = 0; j < amount; j++) {
    const newAddress = keyring.generateAndCacheAddress({ group, skipAddressIndexes })
    addresses.push(newAddress)
    skipAddressIndexes.push(newAddress.index)
  }

  return addresses
}

export const splitResultsArrayIntoOneArrayPerGroup = (array: boolean[], chunkSize: number): boolean[][] => {
  const chunks = []
  let i = 0

  while (i < array.length) {
    chunks.push(array.slice(i, i + chunkSize))
    i += chunkSize
  }

  return chunks
}

export const getGapFromLastActiveAddress = (
  addresses: NonSensitiveAddressData[],
  results: boolean[],
  startingGap = 0
): { gap: number; activeAddresses: NonSensitiveAddressData[] } => {
  let gap = startingGap
  const activeAddresses = []

  for (let j = 0; j < addresses.length; j++) {
    const address = addresses[j]
    const isActive = results[j]

    if (isActive) {
      activeAddresses.push(address)
      gap = 0
    } else {
      gap++
    }
  }

  return {
    gap,
    activeAddresses
  }
}

export function moveToFront<T>(array: T[], item: T): T[] {
  const index = array.indexOf(item)
  if (index > 0) {
    const newArray = [...array]
    newArray.unshift(newArray.splice(index, 1)[0])
    return newArray
  }
  return array
}
