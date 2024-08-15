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

import { keyring, NonSensitiveAddressData } from '@alephium/keyring'
import { AddressSettings, AssetAmount } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { explorer } from '@alephium/web3'

import { Address } from '@/types/addresses'
import { AddressTransaction, PendingTransaction } from '@/types/transactions'
import { getRandomLabelColor } from '@/utils/colors'

export const selectAddressTransactions = (
  addresses: Address[],
  transactions: (explorer.Transaction | PendingTransaction)[]
) => {
  const addressesTxs = addresses.flatMap((address) => address.transactions.map((txHash) => ({ txHash, address })))
  const processedTxHashes: explorer.Transaction['hash'][] = []

  return transactions.reduce((txs, tx) => {
    const addressTxs = addressesTxs.filter(({ txHash }) => txHash === tx.hash)

    addressTxs.forEach((addressTx) => {
      if (
        (!isPendingTransaction(tx) || [tx.fromAddress, tx.toAddress].includes(addressTx.address.hash)) &&
        !processedTxHashes.includes(tx.hash)
      ) {
        processedTxHashes.push(tx.hash)
        txs.push({ ...tx, address: addressTx.address })
      }
    })

    return txs
  }, [] as AddressTransaction[])
}

export const getAvailableBalance = (address: Address): bigint => BigInt(address.balance) - BigInt(address.lockedBalance)

export const getName = (address: Address): string => address.label || `${address.hash.substring(0, 10)}...`

export const getInitialAddressSettings = (): AddressSettings => ({
  isDefault: true,
  color: getRandomLabelColor()
})

export const getAddressAssetsAvailableBalance = (address: Address) => [
  {
    id: ALPH.id,
    availableBalance: getAvailableBalance(address)
  },
  ...address.tokens.map((token) => ({
    id: token.tokenId,
    availableBalance: BigInt(token.balance) - BigInt(token.lockedBalance)
  }))
]

export const assetAmountsWithinAvailableBalance = (address: Address, assetAmounts: AssetAmount[]) => {
  const assetsAvailableBalance = getAddressAssetsAvailableBalance(address)

  return assetAmounts.every((asset) => {
    if (!asset?.amount) return true

    const assetAvailableBalance = assetsAvailableBalance.find(({ id }) => id === asset.id)?.availableBalance

    if (!assetAvailableBalance) return false
    return asset.amount <= assetAvailableBalance
  })
}

const isPendingTransaction = (tx: explorer.Transaction | PendingTransaction): tx is PendingTransaction =>
  (tx as PendingTransaction).status === 'pending'

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
