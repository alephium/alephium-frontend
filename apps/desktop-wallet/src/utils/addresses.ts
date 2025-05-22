import { keyring, NonSensitiveAddressData } from '@alephium/keyring'
import { Address, AddressSettings } from '@alephium/shared'
import { KeyType } from '@alephium/web3'

import { getRandomLabelColor } from '@/utils/colors'

export const getName = (address: Address): string => address.label || `${address.hash.substring(0, 10)}...`

export const getInitialAddressSettings = (): AddressSettings => ({
  isDefault: true,
  color: getRandomLabelColor()
})

type DeriveGrouplessAddressesProps = {
  amount: number
  keyType: Exclude<KeyType, 'default' | 'bip340-schnorr'>
  skipIndexes: number[]
}

type DeriveAddressesWithGroupProps = {
  amount: number
  keyType: 'default' | 'bip340-schnorr'
  skipIndexes: number[]
  group: number
}

type GenerateAddressProps = DeriveGrouplessAddressesProps | DeriveAddressesWithGroupProps

const hasTargetGroup = (props: GenerateAddressProps): props is DeriveAddressesWithGroupProps =>
  props.keyType === 'default' || props.keyType === 'bip340-schnorr'

export const deriveAddresses = (props: GenerateAddressProps) => {
  const { amount, keyType, skipIndexes } = props

  const addresses = []
  const skipAddressIndexes = Array.from(skipIndexes)

  for (let j = 0; j < amount; j++) {
    const newAddress = hasTargetGroup(props)
      ? keyring.generateAndCacheAddress({ group: props.group, skipAddressIndexes, keyType })
      : keyring.generateAndCacheAddress({ skipAddressIndexes, keyType })
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
