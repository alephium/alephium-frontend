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
import { ALPH, TokenInfo } from '@alephium/token-list'
import { explorer } from '@alephium/web3'
import { FungibleTokenMetadata } from '@alephium/web3/dist/src/api/api-explorer'
import { useQueries } from '@tanstack/react-query'
import { chunk } from 'lodash'
import { useMemo } from 'react'

import { addressTokensBalanceQuery } from '@/api/addressQueries'
import { useAddressesLastTransactionHashes } from '@/api/addressTransactionsDataHooks'
import { useFungibleTokenList } from '@/api/fungibleTokenListDataHooks'
import { useAppSelector } from '@/hooks/redux'
import { isDefined } from '@/utils/misc'

export const useAddressesListedFungibleTokens = (addressHash?: AddressHash) => {
  const { data: fungibleTokenList, isLoading: isLoadingFungibleTokenList } = useFungibleTokenList()
  const { data: latestAddressesTxHashes, isLoading: isLoadingLastTxHashes } =
    useAddressesLastTransactionHashes(addressHash)
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  const { data, isLoading } = useQueries({
    queries: latestAddressesTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
      addressTokensBalanceQuery({ addressHash, latestTxHash, previousTxHash, networkId })
    ),
    combine: (results) => ({
      data: results.reduce(
        (acc, { data }) => {
          data?.map(({ tokenId }) => {
            const listedFungibleToken = fungibleTokenList?.find((token) => token.id === tokenId)
            const alreadyAddedToArray = acc.some((token) => token.id === listedFungibleToken?.id)

            if (listedFungibleToken && !alreadyAddedToArray) acc.push(listedFungibleToken)
          })
          return acc
        },
        // Include ALPH in the results
        [ALPH] as TokenInfo[]
      ),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  return {
    data,
    isLoading: isLoading || isLoadingFungibleTokenList || isLoadingLastTxHashes
  }
}

export const useAddressesListedFungibleTokensWithPrice = (addressHash?: AddressHash) => {
  const { data: tokens } = useAddressesListedFungibleTokens(addressHash)

  return useMemo(() => tokens.filter((token) => token.symbol in explorer.TokensWithPrice), [tokens])
}

export const useAddressesUnlistedFungibleTokens = (addressHash?: AddressHash) => {
  const { data: unknownTokenIds, isLoading: isLoadingUnknownTokenIds } = useAddressesUnknownTokenIds(addressHash)
  const { data: tokensByType } = useTokensTypes(unknownTokenIds)

  const { data, isLoading } = useQueries({
    queries: chunk(tokensByType.fungible, TOKENS_QUERY_LIMIT).map((ids) => ({
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
    isLoading: isLoading || isLoadingUnknownTokenIds
  }
}

const convertDecimalsToNumber = (token: FungibleTokenMetadata) => {
  const parsedDecimals = parseInt(token.decimals)

  return {
    ...token,
    decimals: Number.isInteger(parsedDecimals) ? parsedDecimals : 0
  }
}

const useAddressesUnknownTokenIds = (addressHash?: AddressHash) => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const { data: fungibleTokenList, isLoading: isLoadingFungibleTokenList } = useFungibleTokenList()
  const { data: latestAddressesTxHashes, isLoading: isLoadingLatestTxHashes } =
    useAddressesLastTransactionHashes(addressHash)

  const { data, isLoading } = useQueries({
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

  return {
    data,
    isLoading: isLoading || isLoadingFungibleTokenList || isLoadingLatestTxHashes
  }
}

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
            if (
              tokenInfo?.stdInterfaceId &&
              Object.values(explorer.TokenStdInterfaceId).includes(
                tokenInfo.stdInterfaceId as explorer.TokenStdInterfaceId
              )
            ) {
              tokenIdsByType[tokenInfo.stdInterfaceId as explorer.TokenStdInterfaceId].push(tokenInfo.token)
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
