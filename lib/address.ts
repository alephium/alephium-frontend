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

import bs58 from './bs58'
import djb2 from '../lib/djb2'
import { AddressAndKeys, deriveNewAddressData } from './wallet'
import { TOTAL_NUMBER_OF_GROUPS } from './constants'
import { ExplorerClient } from './explorer'

export function addressToGroup(address: string, totalNumberOfGroups: number): number {
  const bytes = bs58.decode(address).slice(1)
  const value = djb2(bytes) | 1
  const hash = toPosInt(xorByte(value))
  const group = hash % totalNumberOfGroups

  return group
}

function xorByte(value: number): number {
  const byte0 = value >> 24
  const byte1 = value >> 16
  const byte2 = value >> 8

  return byte0 ^ byte1 ^ byte2 ^ value
}

export const isAddressValid = (address: string) =>
  !!address && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address) && bs58.decode(address).slice(1).length >= 32

const toPosInt = (byte: number): number => byte & 0xff

/* The algorithm will first derive 20 addresses in each group (so, 80 in total) and make a single request to the server
  which will return a boolean array of 80 elements (20 per group). It will then split this array into 4 arrays (one per
  group) and it will cross-reference the results with the initially derived addresses to find the active ones, while
  keeping count of the subsequent number of addresses that are inactive. Then, it will check whether this counter for
  each group is below the gap, and if it is, it will check the next 20 addresses in the specific group with a following
  request to the server. It will stop once the counter of inactive addresses for each group is equal or larger than the
  predefined gap (5).
*/
export const discoverActiveAddresses = async (
  seed: Buffer,
  addressIndexesToSkip: number[],
  client: ExplorerClient
): Promise<AddressAndKeys[]> => {
  const GAP = 5
  const QUERY_LIMIT = 80
  const NUM_OF_ADDRESSES_PER_GROUP_TO_CHECK = QUERY_LIMIT / TOTAL_NUMBER_OF_GROUPS // 20

  const addressesPerGroup = Array.from({ length: TOTAL_NUMBER_OF_GROUPS }, (): AddressAndKeys[] => [])
  const activeAddresses: AddressAndKeys[] = []
  const skipIndexes = [...addressIndexesToSkip]

  for (let group = 0; group < TOTAL_NUMBER_OF_GROUPS; group++) {
    const newAddresses = deriveAddressesInGroup(group, NUM_OF_ADDRESSES_PER_GROUP_TO_CHECK, seed, skipIndexes)
    addressesPerGroup[group] = newAddresses
    skipIndexes.push(...newAddresses.map((address) => address.addressIndex))
  }

  const addressesToCheckIfActive = addressesPerGroup.flat().map((address) => address.address)
  const result = await client.addressesActive.postAddressesActive(addressesToCheckIfActive)
  const resultsPerGroup = splitResultsArrayIntoOneArrayPerGroup(result.data, NUM_OF_ADDRESSES_PER_GROUP_TO_CHECK)

  for (let group = 0; group < TOTAL_NUMBER_OF_GROUPS; group++) {
    let { gap, activeAddresses: newActiveAddresses } = getGapFromLastActiveAddress(
      addressesPerGroup[group],
      resultsPerGroup[group]
    )

    let gapPerGroup = gap
    activeAddresses.push(...newActiveAddresses)

    while (gapPerGroup <= GAP) {
      const newAddresses = deriveAddressesInGroup(group, NUM_OF_ADDRESSES_PER_GROUP_TO_CHECK, seed, skipIndexes)
      skipIndexes.push(...newAddresses.map((address) => address.addressIndex))

      const addressesToCheckIfActive = newAddresses.map((address) => address.address)
      const result = await client.addressesActive.postAddressesActive(addressesToCheckIfActive)

      ;({ gap, activeAddresses: newActiveAddresses } = getGapFromLastActiveAddress(newAddresses, result.data))
      gapPerGroup += gap
      activeAddresses.push(...newActiveAddresses)
    }
  }

  return activeAddresses
}

const deriveAddressesInGroup = (
  group: number,
  amount: number,
  seed: Buffer,
  skipIndexes: number[]
): AddressAndKeys[] => {
  const addresses = []
  const skipAddressIndexes = [...skipIndexes]

  for (let j = 0; j < amount; j++) {
    const newAddress = deriveNewAddressData(seed, group, undefined, skipAddressIndexes)
    addresses.push(newAddress)
    skipAddressIndexes.push(newAddress.addressIndex)
  }

  return addresses
}

const splitResultsArrayIntoOneArrayPerGroup = (array: boolean[], chunkSize: number): boolean[][] => {
  const chunks = []
  let i = 0

  while (i < array.length) {
    chunks.push(array.slice(i, i + chunkSize))
    i += chunkSize
  }

  return chunks
}

const getGapFromLastActiveAddress = (
  addresses: AddressAndKeys[],
  results: boolean[]
): { gap: number; activeAddresses: AddressAndKeys[] } => {
  let gap = 0
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
