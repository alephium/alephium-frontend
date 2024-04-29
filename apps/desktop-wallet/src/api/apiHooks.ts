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
  NFT,
  pricesQueries,
  sortAssets,
  tokenIsFungible,
  tokenIsKnownFungible,
  tokenIsListed,
  tokenIsNonFungible,
  tokenIsUnknown,
  UnknownAsset,
  useGetAssetsMetadata
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
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
): { addressHash: Address['hash']; assets: (Asset | NFT)[] }[] => {
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
    addressesTokens?.flatMap((a, i) => {
      const tokenIds = a.map((t) => t.tokenId)

      if (addressesAlphBalances[i]) {
        tokenIds.push(ALPH.id)
      }

      return tokenIds || []
    })
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
    const addressAssets = [...addressesTokens[i]]

    if (addressesAlphBalances[i]) {
      addressAssets.push({
        ...ALPH,
        tokenId: ALPH.id,
        balance: addressesAlphBalances[i].balance,
        lockedBalance: addressesAlphBalances[i].lockedBalance
      })
    }

    const tokens = addressAssets.map((t) => {
      const tokenMetadata = addressesAssetsMetadata.flattenKnown.find((a) => a.id === t.tokenId)

      const tokenPrice =
        tokenMetadata && tokenIsListed(tokenMetadata)
          ? tokensPrices.find((p) => p?.symbol === tokenMetadata.symbol)
          : undefined

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

    return {
      addressHash,
      assets: sortAssets(tokens)
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
  deduplicateAssets(
    useAddressesAssets(addressHashes)
      .flatMap((a) => a.assets)
      .filter((t) => tokenIsKnownFungible(t))
  )

export const useAddressesFlattenListedTokens = (addressHashes: string[] = []) =>
  deduplicateAssets(
    useAddressesAssets(addressHashes)
      .flatMap((a) => a.assets)
      .filter((t) => tokenIsListed(t))
  )

export const useAddressesFlattenUnknownTokens = (addressHashes: string[] = []) =>
  deduplicateAssets(
    useAddressesAssets(addressHashes)?.reduce(
      (acc, a) => acc.concat(a.assets.filter(tokenIsUnknown).map((t) => ({ ...t, decimals: 0 }))),
      [] as UnknownAsset[]
    )
  )

export const useAddressesFlattenNfts = (addressHashes: string[] = []) =>
  deduplicateAssets(
    useAddressesAssets(addressHashes)
      .flatMap((a) => a.assets)
      .filter((t) => tokenIsNonFungible(t))
  )

export const useAddressesWorth = (addressHashes: string[]) =>
  useAddressesAssets(addressHashes)?.map((a) => ({
    addressHash: a.addressHash,
    worth: aggregateAssetsWorth(a.assets)
  }))

export const useAddressesTotalWorth = (addressHashes: string[] = []) =>
  useAddressesAssets(addressHashes)?.reduce(
    (acc, address) => acc + aggregateAssetsWorth(address.assets),
    0
  )

const aggregateAssetsWorth = (assets: (Asset | NFT)[]) => {
  return assets.reduce((acc, a) => tokenIsFungible(a) ? acc + (a.worth || 0) : acc, 0)
}

const deduplicateAssets = (assets: (Asset | NFT)[]) => {
  const uniqueAssetsMap = assets.reduce<{ [key: string]: (Asset | NFT) }>((acc, token) => {
    const { id } = token
    if (acc[id]) {
      if (tokenIsFungible(token)) {
        const existingToken = acc[id] as Asset

        existingToken.balance = existingToken.balance ? BigInt(existingToken.balance) + BigInt(token.balance) : BigInt(token.balance)

        existingToken.lockedBalance = existingToken.lockedBalance
          ? BigInt(existingToken.lockedBalance) + BigInt(token.lockedBalance)
          : BigInt(token.lockedBalance)

        existingToken.worth = existingToken.worth && token.worth ? existingToken.worth + token.worth : token.worth
      }
    } else {
      acc[id] = token

      if (tokenIsFungible(token)) {
        const token = acc[id] as Asset

        token.balance = BigInt(token.balance)
        token.lockedBalance = BigInt(token.lockedBalance)
        token.worth = token.worth
      }
    }
    return acc
  }, {})

  return Object.values(uniqueAssetsMap)
}
