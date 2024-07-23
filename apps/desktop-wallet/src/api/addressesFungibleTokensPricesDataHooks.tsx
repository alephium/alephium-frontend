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

import { useAddressesAlphBalances, useAddressesTokensBalances } from '@/api/addressesBalancesDataHooks'
import { useAddressesListedFungibleTokensWithPrice } from '@/api/addressesFungibleTokensInfoDataHooks'
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
      initialData: () =>
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
  const { data: tokenPrices } = useAddressesTokensPrices()

  return tokenPrices.find((token) => token.symbol === ALPH.symbol)?.price
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

export const useAddressesTokensWorth = (addressHash?: AddressHash) => {
  const addressesTokensWithPrice = useAddressesListedFungibleTokensWithPrice(addressHash)
  const { data: tokensBalances, isLoading: isLoadingTokenBalances } = useAddressesTokensBalances(addressHash)
  const { data: tokenPrices, isLoading: isLoadingTokenPrices } = useAddressesTokensPrices()

  const totalWorth = addressesTokensWithPrice.reduce((totalWorth, { id, symbol, decimals }) => {
    const price = tokenPrices.find((t) => t.symbol === symbol)?.price
    const tokenBalance = tokensBalances[id]?.balance

    return price && tokenBalance ? totalWorth + calculateAmountWorth(tokenBalance, price, decimals) : totalWorth
  }, 0)

  return {
    data: totalWorth,
    isLoading: isLoadingTokenBalances || isLoadingTokenPrices
  }
}

export const useAddressesAlphWorth = (addressHash?: AddressHash) => {
  const { data: totalAlphBalances } = useAddressesAlphBalances(addressHash)
  const alphPrice = useAlphPrice()

  return alphPrice !== undefined ? calculateAmountWorth(totalAlphBalances.balance, alphPrice) : undefined
}
