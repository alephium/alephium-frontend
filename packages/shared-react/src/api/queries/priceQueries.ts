import { FIVE_MINUTES_MS, is5XXError, PRICES_REFRESH_INTERVAL, throttledClient } from '@alephium/shared'
import { queryOptions, skipToken } from '@tanstack/react-query'
import axios from 'axios'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { getQueryConfig } from '@/api/apiUtils'
import { queryClient } from '@/api/queryClient'

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
    refetchInterval: PRICES_REFRESH_INTERVAL,
    // When the user changes currency settings we don't want to keep the previous cache for too long.
    ...getQueryConfig({ gcTime: FIVE_MINUTES_MS, networkId }),
    queryFn:
      !skip && networkId !== undefined
        ? async () => {
            try {
              const prices = await throttledClient.explorer.market.postMarketPrices({ currency }, symbols)

              return prices.map((price, i) => ({ price, symbol: symbols[i] }))
            } catch (e) {
              if (is5XXError(e)) {
                const coingeckoIds = symbols.map(symbolToCoingeckoId).filter((id) => id !== '')
                const data = await queryClient.fetchQuery(coingeckoTokensPriceQuery({ ids: coingeckoIds, currency }))

                return symbols.map((symbol) => {
                  const price = data[symbolToCoingeckoId(symbol)]

                  return {
                    price: price ? price[currency] : null,
                    symbol
                  }
                })
              } else {
                throw e
              }
            }
          }
        : skipToken
  })

const coingeckoTokensPriceQuery = ({ ids, currency }: { ids: string[]; currency: string }) =>
  queryOptions({
    queryKey: ['tokenPrices', 'currentPrice', 'coingecko', ids, { currency }],
    queryFn: async () => {
      const { data } = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=${currency}`
      )

      return data
    }
  })

// Aligned with list in
// https://github.com/alephium/explorer-backend/blob/master/app/src/main/resources/application.conf
const symbolToCoingeckoId = (symbol: string) => {
  switch (symbol) {
    case 'ALPH':
      return 'alephium'
    case 'USDC':
      return 'usd-coin'
    case 'USDCeth':
      return 'usd-coin'
    case 'USDCbsc':
      return 'usd-coin'
    case 'USDT':
      return 'tether'
    case 'USDTeth':
      return 'tether'
    case 'USDTbsc':
      return 'tether'
    case 'WBTC':
      return 'wrapped-bitcoin'
    case 'WETH':
      return 'weth'
    case 'DAI':
      return 'dai'
    case 'AYIN':
      return 'ayin'
    case 'ABX':
      return 'alphbanx'
    case 'APAD':
      return 'alphpad'
    case 'EX':
      return 'elexium'
    case 'ONION':
      return 'myonion-fun'
    case 'BNB':
      return 'bnb'
    default:
      return ''
  }
}
