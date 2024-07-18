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

import { client, extractTokenIds, ONE_DAY_MS, TOKENS_QUERY_LIMIT } from '@alephium/shared'
import { TokenInfo, TokenList } from '@alephium/token-list'
import { explorer } from '@alephium/web3'
import { FungibleTokenMetadata } from '@alephium/web3/dist/src/api/api-explorer'
import { skipToken, useQueries, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { chunk, uniq } from 'lodash'
import { useMemo } from 'react'

import { useAppSelector } from '@/hooks/redux'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { makeSelectAddressesConfirmedTransactions } from '@/storage/transactions/transactionsSelectors'
import { NewFungibleToken } from '@/types/assets'
import { isDefined } from '@/utils/misc'

const TOKENS_QUERY_KEY = 'tokens'
const TOKEN_LIST_QUERY_KEY = 'tokenList'

export const useFungibleTokenList = () => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const network = networkId === 0 ? 'mainnet' : networkId === 1 ? 'testnet' : undefined

  const { data, isLoading } = useQuery({
    queryKey: [TOKEN_LIST_QUERY_KEY, network],
    queryFn: !network
      ? skipToken
      : () =>
          axios
            .get(`https://raw.githubusercontent.com/alephium/token-list/master/tokens/${network}.json`)
            .then(({ data }) => (data as TokenList)?.tokens),
    staleTime: ONE_DAY_MS
  })

  // TODO: Maybe return an object instead of an array for faster search?
  return {
    fungibleTokenList: data,
    isLoadingFungibleTokenList: isLoading
  }
}

// TODO: This hook is problematic because it returns new objects/arrays every time a component that uses it re-renders.
// Using `useMemo` everywhere is very hard currently.
export const useAddressesTokens = () => {
  const { isLoadingFungibleTokenList } = useFungibleTokenList()
  const tokenIdsFromConfirmedTransactions = useTokenIdsFromConfirmedTransactions()
  const tokenIdsFromAddressesCurrentBalance = useTokenIdsFromAddressesCurrentBalance()

  const tokenIds = uniq([...tokenIdsFromConfirmedTransactions, ...tokenIdsFromAddressesCurrentBalance])

  const { listedFungibleTokens, unlistedTokenIds } = usePartitionTokens(tokenIds)
  const { tokenIdsByType, isLoadingTokenTypes } = useTokensTypes(unlistedTokenIds)

  const unlistedFungibleTokenIds = tokenIdsByType[explorer.TokenStdInterfaceId.Fungible]
  const nftIds = tokenIdsByType[explorer.TokenStdInterfaceId.NonFungible]

  const { unlistedFungibleTokens, isLoadingUnlistedFungibleTokens } =
    useUnlistedFungibleTokens(unlistedFungibleTokenIds)

  return {
    listedFungibleTokens,
    unlistedFungibleTokens,
    fungibleTokens: [...listedFungibleTokens, ...unlistedFungibleTokens] as NewFungibleToken[],
    nftIds, // TODO: Fetch NFTs
    isLoadingFungibleTokenList,
    isLoadingTokenTypes,
    isLoadingUnlistedFungibleTokens,
    isLoading: isLoadingFungibleTokenList || isLoadingTokenTypes || isLoadingUnlistedFungibleTokens // TODO: Add NFTs
  }
}

const useUnlistedFungibleTokens = (tokenIds: string[]) => {
  const { data, isLoading } = useQueries({
    queries: tokenIds
      ? chunk(tokenIds, TOKENS_QUERY_LIMIT).map((ids) => ({
          queryKey: [TOKENS_QUERY_KEY, 'fungible', 'unlisted', ids],
          queryFn: () => client.explorer.tokens.postTokensFungibleMetadata(ids),
          staleTime: Infinity
        }))
      : [],
    combine: (results) => ({
      data: results.flatMap(({ data }) => data && data.map(convertDecimalsToNumber)).filter(isDefined),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  return {
    unlistedFungibleTokens: data,
    isLoadingUnlistedFungibleTokens: isLoading
  }
}

const convertDecimalsToNumber = (token: FungibleTokenMetadata) => {
  const parsedDecimals = parseInt(token.decimals)

  return {
    ...token,
    decimals: Number.isInteger(parsedDecimals) ? parsedDecimals : 0
  }
}

// Returns an array of listed tokens and an array of unlisted token IDs with a single pass over the tokenIds array
const usePartitionTokens = (tokenIds: string[]) => {
  const { fungibleTokenList: list } = useFungibleTokenList()

  const initialTokenPartitions = {
    listedFungibleTokens: [] as TokenInfo[],
    unlistedTokenIds: [] as string[]
  }

  return list
    ? tokenIds.reduce((acc, id) => {
        const token = list.find((token) => token.id === id)
        token ? acc.listedFungibleTokens.push(token) : acc.unlistedTokenIds.push(id)
        return acc
      }, initialTokenPartitions)
    : initialTokenPartitions
}

const useTokensTypes = (tokenIds: string[]) => {
  const { data, isLoading } = useQueries({
    queries: tokenIds
      ? chunk(tokenIds, TOKENS_QUERY_LIMIT).map((ids) => ({
          queryKey: [TOKENS_QUERY_KEY, 'type', ids],
          queryFn: () => client.explorer.tokens.postTokens(ids),
          staleTime: Infinity
        }))
      : [],
    combine: (results) => ({
      data: results
        .flatMap(({ data }) => data)
        .reduce(
          (tokenIdsByType, tokenInfo) => {
            if (tokenInfo?.stdInterfaceId && tokenInfo.stdInterfaceId in explorer.TokenStdInterfaceId) {
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
    tokenIdsByType: data,
    isLoadingTokenTypes: isLoading
  }
}

const useTokenIdsFromAddressesCurrentBalance = (): string[] => {
  const addresses = useAppSelector(selectAllAddresses)

  return addresses.flatMap((address) => address.tokens).map((token) => token.tokenId)
}

const useTokenIdsFromConfirmedTransactions = (): string[] => {
  const addressConfirmedTransactions = useAppSelector(useMemo(makeSelectAddressesConfirmedTransactions, []))

  return addressConfirmedTransactions.reduce((acc, transaction) => {
    extractTokenIds(acc, transaction.inputs)
    extractTokenIds(acc, transaction.outputs)

    return acc
  }, [] as string[])
}
