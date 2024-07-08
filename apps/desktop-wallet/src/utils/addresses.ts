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
import { AddressHash, AddressSettings, AssetAmount, tokenIsFungible, tokenIsKnownFungible } from '@alephium/shared'
import { useMemo } from 'react'

import { useAddressAssets, useAddressesFlattenKnownFungibleTokens } from '@/api/apiHooks'
import { Address } from '@/types/addresses'
import { getRandomLabelColor } from '@/utils/colors'

export const getAvailableBalance = (address: Address): bigint => BigInt(address.balance) - BigInt(address.lockedBalance)

export const getName = (address: Address): string => address.label || `${address.hash.substring(0, 10)}...`

export const getInitialAddressSettings = (): AddressSettings => ({
  isDefault: true,
  color: getRandomLabelColor()
})

export const useFilteredAddresses = (addresses: Address[], text: string) => {
  const addressHashes = useMemo(() => addresses.map((address) => address.hash), [addresses])
  const { data: addressesAssets } = useAddressesFlattenKnownFungibleTokens(addressHashes)

  return text.length < 2
    ? addresses
    : addresses.filter((address, i) => {
        const addressTokenNames = addressesAssets
          .map((asset) => {
            if (tokenIsKnownFungible(asset)) {
              const tokenName = asset.name
              const tokenSymbol = asset.symbol

              return `${tokenName} ${tokenSymbol}`
            }

            return undefined
          })
          .filter((searchableText) => searchableText !== undefined)
          .join(' ')

        const addressAssetNames = `${address.balance !== '0' ? 'Alephium ALPH ' : ''}${addressTokenNames}`.toLowerCase()

        return (
          address.label?.toLowerCase().includes(text) ||
          address.hash.toLowerCase().includes(text) ||
          addressAssetNames.includes(text)
        )
      })
}

export const useAddressAssetsAvailableBalance = (addressHash: AddressHash) => {
  const { data: addressAssets, isPending } = useAddressAssets(addressHash)

  return {
    data: addressAssets?.filter(tokenIsFungible).map((token) => ({
      id: token.id,
      availableBalance: BigInt(token.balance) - BigInt(token.lockedBalance)
    })),
    isPending
  }
}

export const useAssetAmountsWithinAvailableBalance = (addressHash: AddressHash, assetAmounts?: AssetAmount[]) => {
  const { data: assetsAvailableBalance, isPending } = useAddressAssetsAvailableBalance(addressHash)

  return {
    data: assetAmounts?.every((asset) => {
      if (!asset?.amount) return true

      const assetAvailableBalance = assetsAvailableBalance?.find(({ id }) => id === asset.id)?.availableBalance

      if (!assetAvailableBalance) return false
      return asset.amount <= assetAvailableBalance
    }),
    isPending
  }
}

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
