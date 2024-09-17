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

import { ONE_MINUTE_MS, throttledClient } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { queryOptions, skipToken } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/types'
import queryClient from '@/api/queryClient'

interface TokensPriceQueryProps extends SkipProp {
  symbols: string[]
  currency: string
}

const TOKEN_PRICES_KEY = 'tokenPrices'

export const tokensPriceQuery = ({ symbols, currency, skip }: TokensPriceQueryProps) => {
  const getQueryOptions = (_symbols: TokensPriceQueryProps['symbols']) =>
    queryOptions({
      queryKey: [TOKEN_PRICES_KEY, 'currentPrice', _symbols, { currency }],
      queryFn: !skip
        ? async () => {
            const prices = await throttledClient.explorer.market.postMarketPrices({ currency }, _symbols)

            return prices.map((price, i) => ({ price, symbol: _symbols[i] }))
          }
        : skipToken,
      refetchInterval: ONE_MINUTE_MS
    })

  const previousQueryKey = getQueryOptions([ALPH.symbol]).queryKey
  const latestQueryOptions = getQueryOptions(symbols)

  return queryOptions({
    ...latestQueryOptions,
    placeholderData: queryClient.getQueryData(previousQueryKey)
  })
}
