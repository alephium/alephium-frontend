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

import { AddressHash, Asset, calculateAmountWorth, client, ONE_MINUTE_MS, TOKENS_QUERY_LIMIT } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { chunk, orderBy } from 'lodash'
import { useMemo } from 'react'

import { useAddressesAlphBalances } from '@/api/addressesBalancesDataHooks'
import { useAddressesListedFungibleTokensWithPrice } from '@/api/addressesListedFungibleTokensDataHooks'
import { addressTokensBalanceQuery } from '@/api/addressQueries'
import { useAddressesLastTransactionHashes } from '@/api/addressTransactionsDataHooks'
import { useAppSelector } from '@/hooks/redux'
import { isDefined } from '@/utils/misc'

const TOKEN_PRICES_KEY = 'tokenPrices'

type TokenPrice = {
  symbol: string
  price: number
}

export const useAddressesTokensPrices = () => {
  const currency = useAppSelector((s) => s.settings.fiatCurrency).toLowerCase()
  const addressTokensWithPrice = useAddressesListedFungibleTokensWithPrice()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQueries({
    queries: chunk(
      addressTokensWithPrice.map(({ symbol }) => symbol),
      TOKENS_QUERY_LIMIT
    ).map((symbols) => ({
      queryKey: [TOKEN_PRICES_KEY, 'currentPrice', symbols, { currency }],
      queryFn: async () =>
        (await client.explorer.market.postMarketPrices({ currency }, symbols)).map(
          (price, i) =>
            ({
              price,
              symbol: symbols[i]
            }) as TokenPrice
        ),
      placeholderData: () =>
        queryClient.getQueryData([TOKEN_PRICES_KEY, 'currentPrice', [ALPH.symbol], { currency }]) as TokenPrice[],
      refetchInterval: ONE_MINUTE_MS
    })),
    combine: (results) => ({
      data: results.flatMap(({ data }) => data).filter(isDefined),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  return {
    data,
    isLoading
  }
}

export const useAlphPrice = () => {
  const { data: tokenPrices, isLoading: isLoadingTokenPrices } = useAddressesTokensPrices()

  return {
    data: tokenPrices.find((token) => token.symbol === ALPH.symbol)?.price,
    isLoading: isLoadingTokenPrices
  }
}

export const useSortTokensByWorth = (tokens: Asset[]) => {
  const { data: tokenPrices } = useAddressesTokensPrices()

  const tokensWithWorth = tokens.map((token) => {
    const tokenPrice = tokenPrices.find((t) => t.symbol === token.symbol)

    return {
      ...token,
      worth: tokenPrice ? calculateAmountWorth(token.balance, tokenPrice.price, token.decimals) : undefined
    }
  })

  return orderBy(
    tokensWithWorth,
    [
      (a) => (a.verified ? 0 : 1),
      (a) => a.worth ?? -1,
      (a) => a.verified === undefined,
      (a) => a.name?.toLowerCase(),
      'id'
    ],
    ['asc', 'desc', 'asc', 'asc', 'asc']
  )
}

type TokenId = string

export const useAddressesTokensWorth = (addressHash?: AddressHash) => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const { data: alphWorth, isLoading: isLoadingAlphWorth } = useAddressesAlphWorth(addressHash)
  const { data: latestTxHashes, isLoading: isLoadingLatestTxHashes } = useAddressesLastTransactionHashes(addressHash)
  const { data: tokenPrices, isLoading: isLoadingTokenPrices } = useAddressesTokensPrices()
  const addressesTokensWithPrice = useAddressesListedFungibleTokensWithPrice(addressHash)

  const { data, isLoading } = useQueries({
    queries: latestTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
      addressTokensBalanceQuery({ addressHash, latestTxHash, previousTxHash, networkId })
    ),
    combine: (results) => ({
      data: results.reduce(
        (tokensWorth, { data: balances }) => {
          const tokensBalance = {} as Record<TokenId, bigint | undefined>

          balances?.forEach(({ tokenId, balance }) => {
            tokensBalance[tokenId] = BigInt(balance) + (tokensBalance[tokenId] ?? BigInt(0))
          })

          Object.keys(tokensBalance).forEach((tokenId) => {
            const tokenInfo = addressesTokensWithPrice.find((token) => token.id === tokenId)
            const tokenPrice = tokenPrices.find((token) => token.symbol === tokenInfo?.symbol)
            const tokenBalance = tokensBalance[tokenId]

            if (tokenBalance && tokenPrice && tokenInfo) {
              tokensWorth[tokenId] =
                calculateAmountWorth(tokenBalance, tokenPrice.price, tokenInfo.decimals) + (tokensWorth[tokenId] ?? 0)
            }
          })

          return tokensWorth
        },
        // Include ALPH in the results
        { [ALPH.id]: alphWorth } as Record<TokenId, number | undefined>
      ),
      isLoading: results.some(({ isLoading }) => isLoading)
    })
  })

  return {
    data,
    isLoading: isLoadingAlphWorth || isLoadingLatestTxHashes || isLoadingTokenPrices || isLoading
  }
}

export const useAddressesTokensTotalWorth = (addressHash?: AddressHash) => {
  const { data, isLoading } = useAddressesTokensWorth(addressHash)

  const totalTokensWorth = useMemo(
    () =>
      Object.values(data).reduce((acc, tokenWorth) => {
        if (tokenWorth !== undefined) {
          acc = tokenWorth + (acc ?? 0)
        }
        return acc
      }, 0),
    [data]
  )

  return {
    data: totalTokensWorth,
    isLoading
  }
}

export const useAddressesAlphWorth = (addressHash?: AddressHash) => {
  const { data: totalAlphBalances, isLoading: isLoadingAlphBalances } = useAddressesAlphBalances(addressHash)
  const { data: alphPrice, isLoading: isLoadingAlphPrice } = useAlphPrice()

  const totalWorth = alphPrice !== undefined ? calculateAmountWorth(totalAlphBalances.balance, alphPrice) : undefined

  return {
    data: totalWorth,
    isLoading: isLoadingAlphBalances || isLoadingAlphPrice
  }
}