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
  addressesQueries,
  Asset,
  calculateAmountWorth,
  combineQueriesResult,
  pricesQueries,
  sortAssets,
  tokenIsKnownFungible,
  tokenIsListed,
  tokenIsNonFungible,
  tokenIsUnknown,
  UnknownAsset,
  useGetAssetsMetadata
} from '@alephium/shared'
import { useQueries } from '@tanstack/react-query'
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

  const { data: addressesTokens, pending: tokensBalancesPending } = useQueries({
    queries: addressHashes.map((h) => addressesQueries.balances.getAddressTokensBalances(h)),
    combine: combineQueriesResult
  })

  const { data: addressesAlphBalances, pending: alphBalancePending } = useQueries({
    queries: addressHashes.map((h) => addressesQueries.balances.getAddressAlphBalances(h)),
    combine: combineQueriesResult
  })

  const addressesAssetsMetadata = useAssetsMetadataForCurrentNetwork(
    addressesTokens?.flatMap((a) => a.map((t) => t.tokenId)) || []
  )

  const { data: tokensPrices, pending: tokensPricesPending } = useQueries({
    queries: addressesAssetsMetadata.groupedKnown.listed.map((t) =>
      pricesQueries.getAssetPrice({
        symbol: t.symbol,
        currency
      })
    ),
    combine: combineQueriesResult
  })

  if (!addressesTokens || [tokensBalancesPending, alphBalancePending, tokensPricesPending].some((p) => p === true))
    return []

  return addressHashes.map((addressHash, i) => {
    const addressTokens = addressesTokens[i]

    return {
      addressHash,
      assets: sortAssets(
        addressTokens.map((t) => {
          const tokenMetadata = addressesAssetsMetadata.flattenKnown.find((a) => a.id === t.tokenId)
          
          const tokenPrice = tokenMetadata && 'symbol' in tokenMetadata ? tokensPrices.find((t) => t) : undefined

          const worth = tokenPrice ? calculateAmountWorth(BigInt(t.balance), tokenPrice.price) : undefined
          const decimals = tokenMetadata && 'decimals' in tokenMetadata ? tokenMetadata.decimals : 0

          return {
            ...tokenMetadata,
            id: t.tokenId,
            balance: BigInt(t.balance),
            lockedBalance: BigInt(t.lockedBalance),
            worth,
            decimals
          }
        })
      )
    }
  })
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
