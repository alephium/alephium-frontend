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

import { client, ONE_MINUTE_MS } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { queryOptions } from '@tanstack/react-query'

import queryClient from '@/api/queryClient'

interface TokensPriceQueryProps {
  symbols: string[]
  currency: string
}

const TOKEN_PRICES_KEY = 'tokenPrices'

type TokenPrice = {
  symbol: string
  price: number
}

export const tokensPriceQuery = ({ symbols, currency }: TokensPriceQueryProps) => {
  const getQueryOptions = (_symbols: TokensPriceQueryProps['symbols']) =>
    queryOptions({
      queryKey: [TOKEN_PRICES_KEY, 'currentPrice', _symbols, { currency }],
      queryFn: async () =>
        (await client.explorer.market.postMarketPrices({ currency }, _symbols)).map(
          (price, i) =>
            ({
              price,
              symbol: _symbols[i]
            }) as TokenPrice
        ),
      refetchInterval: ONE_MINUTE_MS
    })

  const previousQueryKey = getQueryOptions([ALPH.symbol]).queryKey
  const latestQueryOptions = getQueryOptions(symbols)

  return queryOptions({
    ...latestQueryOptions,
    placeholderData: queryClient.getQueryData(previousQueryKey)
  })
}
