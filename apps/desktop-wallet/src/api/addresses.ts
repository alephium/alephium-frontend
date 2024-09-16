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

import { NonSensitiveAddressData } from '@alephium/keyring'
import { AddressHash, throttledClient } from '@alephium/shared'
import { explorer, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'

import { Address, AddressTransactionsSyncResult } from '@/types/addresses'
import {
  deriveAddressesInGroup,
  getGapFromLastActiveAddress,
  splitResultsArrayIntoOneArrayPerGroup
} from '@/utils/addresses'

export const fetchAddressesTransactions = async (
  addressHashes: AddressHash[]
): Promise<AddressTransactionsSyncResult[]> => {
  const results = []

  for (const addressHash of addressHashes) {
    const transactions = await throttledClient.explorer.addresses.getAddressesAddressTransactions(addressHash, {
      page: 1
    })

    results.push({
      hash: addressHash,
      transactions
    })
  }

  return results
}

export const fetchAddressTransactionsNextPage = async (address: Address) => {
  let nextPage = address.transactionsPageLoaded
  let nextPageTransactions = [] as explorer.Transaction[]

  if (!address.allTransactionPagesLoaded) {
    nextPage += 1
    nextPageTransactions = await throttledClient.explorer.addresses.getAddressesAddressTransactions(address.hash, {
      page: nextPage
    })
  }

  return {
    hash: address.hash,
    transactions: nextPageTransactions,
    page: nextPage
  }
}

export const fetchAddressesTransactionsNextPage = async (addresses: Address[], nextPage: number) => {
  const addressHashes = addresses.filter((address) => !address.allTransactionPagesLoaded).map((address) => address.hash)
  const transactions = await throttledClient.explorer.addresses.postAddressesTransactions(
    { page: nextPage },
    addressHashes
  )

  return transactions
}

export const discoverAndCacheActiveAddresses = async (
  addressIndexesToSkip: number[] = [],
  minGap = 5
): Promise<NonSensitiveAddressData[]> => {
  const addressesPerGroup = Array.from({ length: TOTAL_NUMBER_OF_GROUPS }, (): NonSensitiveAddressData[] => [])
  const activeAddresses: NonSensitiveAddressData[] = []
  const skipIndexes = Array.from(addressIndexesToSkip)

  for (let group = 0; group < TOTAL_NUMBER_OF_GROUPS; group++) {
    const newAddresses = deriveAddressesInGroup(group, minGap, skipIndexes)
    addressesPerGroup[group] = newAddresses
    skipIndexes.push(...newAddresses.map((address) => address.index))
  }

  const addressesToCheckIfActive = addressesPerGroup.flat().map((address) => address.hash)
  const results = await getActiveAddressesResults(addressesToCheckIfActive)
  const resultsPerGroup = splitResultsArrayIntoOneArrayPerGroup(results, minGap)

  for (let group = 0; group < TOTAL_NUMBER_OF_GROUPS; group++) {
    const { gap, activeAddresses: newActiveAddresses } = getGapFromLastActiveAddress(
      addressesPerGroup[group],
      resultsPerGroup[group]
    )

    let gapPerGroup = gap
    activeAddresses.push(...newActiveAddresses)

    while (gapPerGroup < minGap) {
      const remainingGap = minGap - gapPerGroup
      const newAddresses = deriveAddressesInGroup(group, remainingGap, skipIndexes)
      skipIndexes.push(...newAddresses.map((address) => address.index))

      const newAddressesToCheckIfActive = newAddresses.map((address) => address.hash)
      const results = await getActiveAddressesResults(newAddressesToCheckIfActive)

      const { gap, activeAddresses: newActiveAddresses } = getGapFromLastActiveAddress(
        newAddresses,
        results,
        gapPerGroup
      )
      gapPerGroup = gap
      activeAddresses.push(...newActiveAddresses)
    }
  }

  return activeAddresses
}

const getActiveAddressesResults = async (addressesToCheckIfActive: string[]): Promise<boolean[]> => {
  const QUERY_LIMIT = 80
  const results: boolean[] = []
  let queryPage = 0

  while (addressesToCheckIfActive.length > results.length) {
    const addressesToQuery = addressesToCheckIfActive.slice(queryPage * QUERY_LIMIT, ++queryPage * QUERY_LIMIT)
    const response = await throttledClient.explorer.addresses.postAddressesUsed(addressesToQuery)

    results.push(...response)
  }

  return results
}
