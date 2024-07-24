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

import { AddressHash, client, TOKENS_QUERY_LIMIT } from '@alephium/shared'
import { explorer } from '@alephium/web3'
import { FungibleTokenMetadata } from '@alephium/web3/dist/src/api/api-explorer'
import { useQueries } from '@tanstack/react-query'
import { chunk } from 'lodash'

import { addressTokensBalanceQuery } from '@/api/addressQueries'
import { useAddressesLastTransactionHashes } from '@/api/addressTransactionsDataHooks'
import { useFungibleTokenList } from '@/api/fungibleTokenListDataHooks'
import { useAppSelector } from '@/hooks/redux'
import { isDefined } from '@/utils/misc'

export const useAddressesUnlistedNonStandardTokenIds = (addressHash?: AddressHash) => {
  const {
    data: { 'non-standard': unlinstedNonStandardTokenIds },
    isLoading
  } = useAddressesUnlistedTokenTypes(addressHash)

  return {
    data: unlinstedNonStandardTokenIds,
    isLoading
  }
}

export const useAddressesUnlistedFungibleTokens = (addressHash?: AddressHash) => {
  const {
    data: { fungible: unlistedFungibleTokenIds },
    isLoading: isLoadingUnlistedTokenTypes
  } = useAddressesUnlistedTokenTypes(addressHash)

  const { data, isLoading } = useQueries({
    queries: chunk(unlistedFungibleTokenIds, TOKENS_QUERY_LIMIT).map((ids) => ({
      queryKey: ['tokens', 'fungible', 'unlisted', ids],
      queryFn: () => client.explorer.tokens.postTokensFungibleMetadata(ids),
      staleTime: Infinity
    })),
    combine: (results) => ({
      data: results.flatMap(({ data }) => data && data.map(convertDecimalsToNumber)).filter(isDefined),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  return {
    data,
    isLoading: isLoading || isLoadingUnlistedTokenTypes
  }
}

// Helper functions and hooks

const convertDecimalsToNumber = (token: FungibleTokenMetadata) => {
  const parsedDecimals = parseInt(token.decimals)

  return {
    ...token,
    decimals: Number.isInteger(parsedDecimals) ? parsedDecimals : 0
  }
}

const useAddressesUnlistedTokenTypes = (addressHash?: AddressHash) => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const { data: fungibleTokenList, isLoading: isLoadingFungibleTokenList } = useFungibleTokenList()
  const { data: latestAddressesTxHashes, isLoading: isLoadingLatestTxHashes } =
    useAddressesLastTransactionHashes(addressHash)

  const { data: unknownTypeTokenIds, isLoading: isLoadingUnknownTypeTokenIds } = useQueries({
    queries: isLoadingFungibleTokenList
      ? []
      : latestAddressesTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
          addressTokensBalanceQuery({ addressHash, latestTxHash, previousTxHash, networkId })
        ),
    combine: (results) => ({
      data: results.reduce((acc, { data }) => {
        data?.map(({ tokenId }) => {
          const isTokenListed = fungibleTokenList?.some((token) => token.id === tokenId)

          if (!isTokenListed && !acc.some((id) => id === tokenId)) {
            acc.push(tokenId)
          }
        })

        return acc
      }, [] as string[]),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  const { data: tokensByType, isLoading: isLoadingTokensTypes } = useTokensTypes(unknownTypeTokenIds)

  return {
    data: tokensByType,
    isLoading:
      isLoadingUnknownTypeTokenIds || isLoadingFungibleTokenList || isLoadingLatestTxHashes || isLoadingTokensTypes
  }
}

const StdInterfaceIds = Object.values(explorer.TokenStdInterfaceId)

const useTokensTypes = (tokenIds: string[]) => {
  const { data, isLoading } = useQueries({
    queries: chunk(tokenIds, TOKENS_QUERY_LIMIT).map((ids) => ({
      queryKey: ['tokens', 'type', ids],
      queryFn: () => client.explorer.tokens.postTokens(ids),
      staleTime: Infinity
    })),
    combine: (results) => ({
      data: results
        .flatMap(({ data }) => data)
        .reduce(
          (tokenIdsByType, tokenInfo) => {
            if (!tokenInfo) return tokenIdsByType
            const stdInterfaceId = tokenInfo.stdInterfaceId as explorer.TokenStdInterfaceId

            if (StdInterfaceIds.includes(stdInterfaceId)) {
              tokenIdsByType[stdInterfaceId].push(tokenInfo.token)
            } else {
              // Except from NonStandard, the interface might be any string or undefined. We merge all that together.
              tokenIdsByType[explorer.TokenStdInterfaceId.NonStandard].push(tokenInfo.token)
            }

            return tokenIdsByType
          },
          {
            [explorer.TokenStdInterfaceId.Fungible]: [],
            [explorer.TokenStdInterfaceId.NonFungible]: [],
            [explorer.TokenStdInterfaceId.NonStandard]: []
          } as Record<explorer.TokenStdInterfaceId, Array<string>>
        ),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  return {
    data,
    isLoading
  }
}
