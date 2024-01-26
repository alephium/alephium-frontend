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

import { AddressHash, getTransactionsOfAddress } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { explorer, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import bigInteger from 'big-integer'
import * as Clipboard from 'expo-clipboard'

import { persistAddressesMetadata } from '~/persistent-storage/wallet'
import { Address, AddressDiscoveryGroupData, AddressPartial } from '~/types/addresses'
import { AddressTransaction, PendingTransaction } from '~/types/transactions'
import { showToast, ToastDuration } from '~/utils/layout'

export const getAddressDisplayName = (address: Address): string =>
  address.settings.label || address.hash.substring(0, 6)

export const copyAddressToClipboard = async (addressHash: AddressHash) => {
  await Clipboard.setStringAsync(addressHash)
  showToast({ text1: 'Address copied!', visibilityTime: ToastDuration.SHORT })
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

  const newDefaultAddress = addresses.find((address) => address.settings.isDefault)
  if (newDefaultAddress && oldDefaultAddress && oldDefaultAddress.hash !== newDefaultAddress.hash) {
    const updatedOldDefaultAddress = { index: oldDefaultAddress.index, ...oldDefaultAddress.settings, isDefault: false }
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
  const processedTxHashes: explorer.Transaction['hash'][] = []

  return transactions.reduce((txs, tx) => {
    const addressTxs = addressesTxs.filter(({ txHash }) => txHash === tx.hash)

    addressTxs.forEach((addressTx) => {
      if (
        (!isPendingTransaction(tx) || tx.fromAddress === addressTx.address.hash) &&
        !processedTxHashes.includes(tx.hash)
      ) {
        processedTxHashes.push(tx.hash)
        txs.push({ ...tx, address: addressTx.address })
      }
    })

    return txs
  }, [] as AddressTransaction[])
}

export const selectContactConfirmedTransactions = (
  allAddresses: Address[],
  transactions: explorer.Transaction[],
  contactAddressHash: AddressHash
) => associateTxsWithAddresses(getTransactionsOfAddress(transactions, contactAddressHash), allAddresses)

export const selectContactPendingTransactions = (
  allAddresses: Address[],
  transactions: PendingTransaction[],
  contactAddressHash: AddressHash
) =>
  associateTxsWithAddresses(
    transactions.filter(
      (tx) => tx.fromAddress === contactAddressHash || (tx.type === 'transfer' && tx.toAddress) === contactAddressHash
    ),
    allAddresses
  )

// TODO: Same as in desktop wallet
export const getAddressAssetsAvailableBalance = (address: Address) => [
  {
    id: ALPH.id,
    availableBalance: BigInt(address.balance) - BigInt(address.lockedBalance)
  },
  ...address.tokens.map((token) => ({
    id: token.tokenId,
    availableBalance: BigInt(token.balance) - BigInt(token.lockedBalance)
  }))
]

// TODO: Same as in desktop wallet
const isPendingTransaction = (tx: explorer.Transaction | PendingTransaction): tx is PendingTransaction =>
  (tx as PendingTransaction).status === 'pending'

const associateTxsWithAddresses = (transactions: (explorer.Transaction | PendingTransaction)[], addresses: Address[]) =>
  transactions.reduce((txs, tx) => {
    const address = addresses.find((address) => address.transactions.includes(tx.hash))

    if (address) txs.push({ ...tx, address })

    return txs
  }, [] as AddressTransaction[])
