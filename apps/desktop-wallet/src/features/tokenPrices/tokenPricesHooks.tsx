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
  AddressHash,
  Asset,
  calculateAmountWorth,
  CHART_DATE_FORMAT,
  client,
  ONE_MINUTE_MS,
  TokenHistoricalPrice,
  TOKENS_QUERY_LIMIT
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { explorer } from '@alephium/web3'
import { useQueries, useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { chunk, orderBy } from 'lodash'
import { useMemo } from 'react'

import { useAppSelector } from '@/hooks/redux'
import {
  makeSelectAddressesKnownFungibleTokens,
  makeSelectAddressesListedFungibleTokenSymbols
} from '@/storage/addresses/addressesSelectors'

export const useAddressesTokensPrices = () => {
  const currency = useAppSelector((s) => s.settings.fiatCurrency).toLowerCase()
  const addressTokensSymbols = useAppSelector(useMemo(makeSelectAddressesListedFungibleTokenSymbols, [])) // TODO: To be replaced when tokens are fetched with Tanstack
  const addressTokensSymbolsWithPrice = addressTokensSymbols.filter((symbol) => symbol in explorer.TokensWithPrice)

  const { data, isPending } = useQueries({
    queries: chunk(addressTokensSymbolsWithPrice, TOKENS_QUERY_LIMIT).map((symbols) => ({
      queryKey: ['tokenPrices', 'currentPrice', symbols, { currency }],
      queryFn: async () =>
        (await client.explorer.market.postMarketPrices({ currency }, symbols)).map((price, i) => ({
          price,
          symbol: symbols[i]
        })),
      refetchInterval: ONE_MINUTE_MS
    })),
    combine: (results) => ({
      data: results.flatMap(({ data }) => data).filter((price) => !!price),
      isPending: results.some(({ isPending }) => isPending)
    })
  })

  return { data, isPending }
}

export const useAlphPrice = () => {
  const { data: tokenPrices } = useAddressesTokensPrices()

  return tokenPrices.find((token) => token.symbol === ALPH.symbol)?.price
}

export const useAlphHistoricalPrices = () => {
  const currency = useAppSelector((s) => s.settings.fiatCurrency).toLowerCase()

  const { data: alphPriceHistory } = useQuery({
    queryKey: ['tokensPrice', 'historicalPrice', ALPH.symbol, currency],
    queryFn: () =>
      client.explorer.market.getMarketPricesSymbolCharts(ALPH.symbol, { currency }).then((rawHistory) => {
        const today = dayjs().format(CHART_DATE_FORMAT)
        const history = [] as TokenHistoricalPrice[]

        if (rawHistory.timestamps && rawHistory.prices) {
          for (let index = 0; index < rawHistory.timestamps.length; index++) {
            const timestamp = rawHistory.timestamps[index]
            const price = rawHistory.prices[index]

            const itemDate = dayjs(timestamp).format(CHART_DATE_FORMAT)
            const prevItemDate =
              index > 1 ? dayjs(rawHistory.timestamps[index - 1]).format(CHART_DATE_FORMAT) : undefined

            if (itemDate !== prevItemDate && itemDate !== today) {
              history.push({
                date: itemDate,
                value: price
              })
            }
          }
        }

        return history
      })
  })

  return alphPriceHistory
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

export const useAddressesTokensWorth = (addressHashes?: AddressHash[] | AddressHash) => {
  const { data: tokenPrices } = useAddressesTokensPrices()
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const tokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHashes))

  return tokenPrices.reduce((totalWorth, { symbol, price }) => {
    const token = tokens.find((t) => t.symbol === symbol)

    return token ? totalWorth + calculateAmountWorth(token.balance, price, token.decimals) : totalWorth
  }, 0)
}
