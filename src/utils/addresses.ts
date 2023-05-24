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

import { explorer, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import bigInteger from 'big-integer'
import * as Clipboard from 'expo-clipboard'
import Toast from 'react-native-root-toast'

import { persistAddressesMetadata } from '~/persistent-storage/wallets'
import { Address, AddressDiscoveryGroupData, AddressHash, AddressPartial } from '~/types/addresses'
import { AddressTransaction, PendingTransaction } from '~/types/transactions'

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

export const persistAddressesSettings = async (
  addresses: AddressPartial[],
  metadataId: string,
  oldDefaultAddress?: Address
) => {
  const addressesMetadata = addresses.map((address) => ({ index: address.index, ...address.settings }))
  await persistAddressesMetadata(metadataId, addressesMetadata)

  const newDefaultAddress = addresses.find((address) => address.settings.isMain)
  if (newDefaultAddress && oldDefaultAddress && oldDefaultAddress.hash !== newDefaultAddress.hash) {
    const updatedOldDefaultAddress = { index: oldDefaultAddress.index, ...oldDefaultAddress.settings, isMain: false }
    await persistAddressesMetadata(metadataId, [updatedOldDefaultAddress])
  }
}

export const initializeAddressDiscoveryGroupsData = (addresses: Address[]): AddressDiscoveryGroupData[] => {
  const groupsData: AddressDiscoveryGroupData[] = Array.from({ length: TOTAL_NUMBER_OF_GROUPS }, () => ({
    highestIndex: undefined,
    gap: 0
  }))

  for (const address of addresses) {
    const groupData = groupsData[address.group]

    if (groupData.highestIndex === undefined || groupData.highestIndex < address.index) {
      groupData.highestIndex = address.index
    }
  }

  return groupsData
}

export const getAddressAvailableBalance = (address: Address): bigint =>
  BigInt(bigInteger(address.balance).minus(bigInteger(address.lockedBalance)).toString())

// TODO: Move into store directory
export const selectAddressTransactions = (
  allAddresses: Address[],
  transactions: (explorer.Transaction | PendingTransaction)[],
  addressHashes?: AddressHash | AddressHash[]
) => {
  const addresses =
    addressHashes !== undefined
      ? Array.isArray(addressHashes)
        ? allAddresses.filter((address) => addressHashes.includes(address.hash))
        : allAddresses.filter((address) => addressHashes === address.hash)
      : allAddresses
  const addressesTxs = addresses.flatMap((address) => address.transactions.map((txHash) => ({ txHash, address })))

  return transactions.reduce((txs, tx) => {
    const addressTx = addressesTxs.find(({ txHash }) => txHash === tx.hash)
    if (addressTx) txs.push({ ...tx, address: addressTx.address })

    return txs
  }, [] as AddressTransaction[])
}
