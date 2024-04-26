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

import {
  Asset,
  calculateAmountWorth,
  sortAssets,
  tokenIsKnownFungible,
  tokenIsListed,
  tokenIsNonFungible,
  tokenIsUnknown,
  UnknownAsset,
  useGetAddressesTokensBalancesQuery,
  useGetAssetsMetadata,
  useGetPricesQuery
} from '@alephium/shared'
import { groupBy } from 'lodash'

import { useAppSelector } from '@/hooks/redux'
import { Address } from '@/types/addresses'

// TODO: Extract these hooks to shared

export const useAssetsMetadataForCurrentNetwork = (assetIds: string[]) => {
  const networkName = useAppSelector((state) => state.network.name)
  return useGetAssetsMetadata(assetIds, networkName)
}

export const useAddressesAssets = (
  addressHashes: string[] = []
): { addressHash: Address['hash']; assets: Asset[] }[] => {
  const currency = useAppSelector((state) => state.settings.fiatCurrency)
  const { data: addressesTokens } = useGetAddressesTokensBalancesQuery(addressHashes)

  const addressesAssetsMetadata = useAssetsMetadataForCurrentNetwork(
    addressesTokens?.flatMap((a) => a.tokenBalances.map((t) => t.id)) || []
  )

  const tokenPrices = useGetPricesQuery({
    tokenSymbols: addressesAssetsMetadata.groupedKnown.listed.map((t) => t.symbol),
    currency
  })

  return (
    addressesTokens?.map((t) => ({
      addressHash: t.addressHash,
      assets: sortAssets(
        t.tokenBalances.map((b) => {
          const tokenMetadata = addressesAssetsMetadata.flattenKnown.find((a) => a.id === b.id)
          const tokenPrice =
            tokenMetadata && 'symbol' in tokenMetadata ? tokenPrices.data?.[tokenMetadata?.symbol] : undefined

          const worth = tokenPrice ? calculateAmountWorth(BigInt(b.balance), tokenPrice) : undefined
          const decimals = tokenMetadata && 'decimals' in tokenMetadata ? tokenMetadata.decimals : 0

          return {
            ...b,
            ...tokenMetadata,
            balance: BigInt(b.balance),
            lockedBalance: BigInt(b.lockedBalance),
            worth,
            decimals
          }
        })
      )
    })) || []
  )
}

export const useAddressesGroupedAssets = (addressHashes: string[]) => {
  const addressesAssets = useAddressesAssets(addressHashes)

  const groupedTokens = groupBy(
    addressesAssets?.flatMap((a) => a.assets),
    (t) => {
      if (tokenIsListed(t)) {
        return 'listed'
      } else if (tokenIsNonFungible(t)) {
        return 'nft'
      } else if (tokenIsKnownFungible(t)) {
        return 'fungible'
      } else {
        return 'unknown'
      }
    }
  )

  return addressesAssets?.map((a) => ({
    addressHash: a.addressHash,
    ...groupedTokens
  }))
}

export const useAddressesFlattenAssets = (addressHashes: string[] = []) =>
  useAddressesAssets(addressHashes)?.flatMap((a) => a.assets)

export const useAddressesFlattenKnownFungibleTokens = (addressHashes: string[] = []) =>
  useAddressesAssets(addressHashes)
    .flatMap((a) => a.assets)
    .filter((t) => tokenIsKnownFungible(t))

export const useAddressesFlattenListedTokens = (addressHashes: string[] = []) =>
  useAddressesAssets(addressHashes)
    .flatMap((a) => a.assets)
    .filter((t) => tokenIsListed(t))

export const useAddressesFlattenUnknownTokens = (addressHashes: string[] = []) =>
  useAddressesAssets(addressHashes)?.reduce(
    (acc, a) => acc.concat(a.assets.filter(tokenIsUnknown).map((t) => ({ ...t, decimals: 0 }))),
    [] as UnknownAsset[]
  )

export const useAddressesFlattenNfts = (addressHashes: string[] = []) =>
  useAddressesAssets(addressHashes)
    .flatMap((a) => a.assets)
    .filter((t) => tokenIsNonFungible(t))

export const useAddressesWorth = (addressHashes: string[]) =>
  useAddressesAssets(addressHashes)?.map((a) => ({
    addressHash: a.addressHash,
    worth: a.assets.reduce((acc, a) => acc + (a.worth || 0), 0)
  }))

export const useAddressesTotalWorth = (addressHashes: string[] = []) =>
  useAddressesAssets(addressHashes)?.reduce(
    (acc, address) => acc + address.assets.reduce((acc, asset) => acc + (asset.worth || 0), 0),
    0
  )
