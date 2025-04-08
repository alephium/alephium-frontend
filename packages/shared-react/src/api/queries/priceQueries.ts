import { FIVE_MINUTES_MS, ONE_MINUTE_MS, throttledClient } from '@alephium/shared'
import { queryOptions, skipToken } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { getQueryConfig } from '@/api/apiUtils'

interface TokensPriceQueryProps extends SkipProp {
  symbols: string[]
  currency: string
  networkId?: number
}

export type TokenPrice = {
  price: number
  symbol: string
}

export const tokensPriceQuery = ({ symbols, currency, networkId, skip }: TokensPriceQueryProps) =>
  queryOptions<TokenPrice[]>({
    queryKey: ['tokenPrices', 'currentPrice', symbols, { currency, networkId }],
    refetchInterval: ONE_MINUTE_MS,
    // When the user changes currency settings we don't want to keep the previous cache for too long.
    ...getQueryConfig({ gcTime: FIVE_MINUTES_MS, networkId }),
    queryFn:
      !skip && networkId !== undefined
        ? async () => {
            const prices = await throttledClient.explorer.market.postMarketPrices({ currency }, symbols)

            return prices.map((price, i) => ({ price, symbol: symbols[i] }))
          }
        : skipToken
  })
