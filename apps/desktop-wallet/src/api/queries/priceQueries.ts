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

import { FIVE_MINUTES_MS, ONE_MINUTE_MS, throttledClient } from '@alephium/shared'
import { queryOptions, skipToken } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'

interface TokensPriceQueryProps extends SkipProp {
  symbols: string[]
  currency: string
}

export const tokensPriceQuery = ({ symbols, currency, skip }: TokensPriceQueryProps) =>
  queryOptions({
    queryKey: ['tokenPrices', 'currentPrice', symbols, { currency }],
    refetchInterval: ONE_MINUTE_MS,
    gcTime: FIVE_MINUTES_MS,
    queryFn: !skip
      ? async () => {
          const prices = await throttledClient.explorer.market.postMarketPrices({ currency }, symbols)

          return prices.map((price, i) => ({ price, symbol: symbols[i] }))
        }
      : skipToken
  })
