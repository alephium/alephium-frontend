import { AddressHash, AddressSettings, DEPRECATED_Address as Address, getTransactionsOfAddress } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { explorer, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import bigInteger from 'big-integer'
import * as Clipboard from 'expo-clipboard'

import i18n from '~/features/localization/i18n'
import { persistAddressesMetadata } from '~/persistent-storage/wallet'
import { AddressDiscoveryGroupData, AddressMetadataWithHash } from '~/types/addresses'
import {
  AddressConfirmedTransaction,
  AddressPendingTransaction,
  AddressTransaction,
  PendingTransaction
} from '~/types/transactions'
import { getRandomLabelColor } from '~/utils/colors'
import { showToast, ToastDuration } from '~/utils/layout'

export const getAddressDisplayName = (address: Address): string => address.label || address.hash.substring(0, 6)

export const copyAddressToClipboard = async (addressHash: AddressHash) => {
  try {
    await Clipboard.setStringAsync(addressHash)
    showToast({ text1: i18n.t('Address copied!'), visibilityTime: ToastDuration.SHORT })
  } catch (error) {
    console.log(error)
    showToast({ text1: i18n.t('Error while copying address'), visibilityTime: ToastDuration.SHORT, type: 'error' })
  }
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
  addressesMetadata: AddressMetadataWithHash[],
  metadataId: string,
  oldDefaultAddress?: Address
) => {
  await persistAddressesMetadata(metadataId, addressesMetadata)

  const newDefaultAddress = addressesMetadata.find((address) => address.isDefault)
  if (newDefaultAddress && oldDefaultAddress && oldDefaultAddress.hash !== newDefaultAddress.hash) {
    const updatedOldDefaultAddress = {
      ...oldDefaultAddress,
      isDefault: false
    }
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

export const selectAddressPendingTransactions = (
  allAddresses: Address[],
  transactions: PendingTransaction[],
  addressHashes?: AddressHash | AddressHash[]
) => {
  const addresses =
    addressHashes !== undefined
      ? Array.isArray(addressHashes)
        ? allAddresses.filter((address) => addressHashes.includes(address.hash))
        : allAddresses.filter((address) => addressHashes === address.hash)
      : allAddresses

  return transactions.reduce((acc, tx) => {
    const address = addresses.find((address) => address.hash === tx.fromAddress)

    if (address) {
      acc.push({
        ...tx,
        address
      })
    }
    return acc
  }, [] as AddressPendingTransaction[])
}

export const selectAddressConfirmedTransactions = (
  allAddresses: Address[],
  transactions: explorer.Transaction[],
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

  return transactions.reduce((acc, tx) => {
    const addressTxs = addressesTxs.filter(({ txHash }) => txHash === tx.hash)

    addressTxs.forEach((addressTx) => {
      if (!processedTxHashes.includes(tx.hash)) {
        processedTxHashes.push(tx.hash)
        acc.push({ ...tx, address: addressTx.address })
      }
    })

    return acc
  }, [] as AddressConfirmedTransaction[])
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

// Same as in desktop wallet
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

const associateTxsWithAddresses = (transactions: (explorer.Transaction | PendingTransaction)[], addresses: Address[]) =>
  transactions.reduce((txs, tx) => {
    const address = addresses.find((address) => address.transactions.includes(tx.hash))

    if (address) txs.push({ ...tx, address })

    return txs
  }, [] as AddressTransaction[])

export const getInitialAddressSettings = (): AddressSettings => ({
  isDefault: true,
  color: getRandomLabelColor()
})
