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

import { useAppSelector } from '@/hooks/redux'
import { Address } from '@/types/addresses'

// TODO: Extract these hooks to shared

export const useAssetsMetadataForCurrentNetwork = (assetIds: string[]) => {
  const networkName = useAppSelector((state) => state.network.name)
  return useGetAssetsMetadata(assetIds, networkName)
}

export const useAddressesAssets = (
  addressHashes: string[] = []
): { addressesAssets: { addressHash: Address['hash']; assets: (Asset | NFT)[] }[]; isPending: boolean } => {
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

  const isPending = [tokensBalancesPending, alphBalancePending, tokensPricesPending].some((p) => p === true)

  return {
    addressesAssets: isPending
      ? []
      : addressHashes.map((addressHash, i) => {
          if (!addressesTokens[i]) {
            return {
              addressHash,
              isPending,
              assets: []
            }
          }

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
            isPending,
            assets: sortAssets(tokens)
          }
        }),
    isPending
  }
}

export const useAddressesGroupedAssets = (addressHashes: string[]) => {
  const { addressesAssets, isPending } = useAddressesAssets(addressHashes)

  const groupedAssets = groupByAssetType(addressesAssets?.flatMap((a) => a.assets))

  return {
    data: addressesAssets?.map((a) => ({
      addressHash: a.addressHash,
      assets: groupedAssets
    })),
    isPending
  }
}

export const useAddressAssets = (addressHash: string) => {
  const { addressesAssets, isPending } = useAddressesAssets([addressHash])

  return {
    data: addressesAssets[0]?.assets || [],
    isPending
  }
}

export const useAddressesFlattenAssets = (addressHashes: string[] = []) => {
  const { addressesAssets, isPending } = useAddressesAssets(addressHashes)

  return { data: addressesAssets.flatMap((a) => a.assets), isPending }
}

export const useAddressesFlattenKnownFungibleTokens = (addressHashes: string[] = []) => {
  const { addressesAssets, isPending } = useAddressesAssets(addressHashes)
  return {
    data: deduplicateAssets(addressesAssets.flatMap((a) => a.assets).filter((t) => tokenIsKnownFungible(t))) as Asset[],
    isPending
  }
}

export const useAddressesFlattenListedTokens = (addressHashes: string[] = []) => {
  const { addressesAssets, isPending } = useAddressesAssets(addressHashes)
  return {
    data: deduplicateAssets(addressesAssets.flatMap((a) => a.assets).filter((t) => tokenIsListed(t))) as Asset[],
    isPending
  }
}

export const useAddressesFlattenUnknownTokens = (addressHashes: string[] = []) => {
  const { addressesAssets, isPending } = useAddressesAssets(addressHashes)
  return {
    data: deduplicateAssets(
      addressesAssets?.reduce(
        (acc, a) => acc.concat(a.assets.filter(tokenIsUnknown).map((t) => ({ ...t, decimals: 0 }))),
        [] as UnknownAsset[]
      )
    ) as UnknownAsset[],
    isPending
  }
}

export const useAddressesFlattenNfts = (addressHashes: string[] = []) => {
  const { addressesAssets, isPending } = useAddressesAssets(addressHashes)

  return {
    data: addressesAssets.flatMap((a) => a.assets).filter((t) => tokenIsNonFungible(t)) as NFT[],
    isPending
  }
}

export const useAddressesWorth = (addressHashes: string[]) => {
  const { addressesAssets, isPending } = useAddressesAssets(addressHashes)

  return {
    data: addressesAssets.map((a) => ({
      addressHash: a.addressHash,
      worth: aggregateAssetsWorth(a.assets)
    })),
    isPending
  }
}

export const useAddressesTotalWorth = (addressHashes: string[] = []) => {
  const { addressesAssets, isPending } = useAddressesAssets(addressHashes)

  return {
    data: addressesAssets.reduce((acc, address) => acc + aggregateAssetsWorth(address.assets), 0),
    isPending
  }
}

const aggregateAssetsWorth = (assets: (Asset | NFT)[]) =>
  assets.reduce((acc, a) => (tokenIsFungible(a) ? acc + (a.worth || 0) : acc), 0)

const deduplicateAssets = (assets: (Asset | NFT)[]) => {
  const uniqueAssetsMap = assets.reduce<{ [key: string]: Asset | NFT }>((acc, token) => {
    const { id } = token
    if (acc[id]) {
      if (tokenIsFungible(token)) {
        const existingToken = acc[id] as Asset

        existingToken.balance = existingToken.balance
          ? BigInt(existingToken.balance) + BigInt(token.balance)
          : BigInt(token.balance)

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
      }
    }
    return acc
  }, {})

  return Object.values(uniqueAssetsMap)
}

// TODO: Move to shared (typed custom groupBy function)
type GroupFunction<T, K extends string | number> = (item: T) => K

const groupBy = <T, K extends string | number>(items: T[], groupFn: GroupFunction<T, K>): Record<K, T[]> => {
  const groups: Record<K, T[]> = {} as Record<K, T[]>

  items.forEach((item) => {
    const key = groupFn(item)
    if (!(key in groups)) {
      groups[key] = []
    }
    groups[key].push(item)
  })

  return groups
}

const groupByAssetType = (assets: (Asset | NFT)[]) => {
  const groupedAssets = groupBy(assets, (a) => {
    if (tokenIsListed(a)) {
      return 'listed'
    } else if (tokenIsNonFungible(a)) {
      return 'nft'
    } else if (tokenIsKnownFungible(a)) {
      return 'fungible'
    } else {
      return 'unknown'
    }
  })

  return {
    listed: (groupedAssets.listed || []) as Asset[],
    fungible: (groupedAssets.fungible || []) as Asset[],
    nft: (groupedAssets.nft || []) as NFT[],
    unknown: (groupedAssets.unknown || []) as UnknownAsset[]
  }
}
