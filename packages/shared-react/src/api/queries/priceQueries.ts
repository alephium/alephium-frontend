import { FIVE_MINUTES_MS, is5XXError, PRICES_REFRESH_INTERVAL } from '@alephium/shared'
import { throttledClient } from '@alephium/shared/api'
import { queryOptions, skipToken } from '@tanstack/react-query'

import { SkipProp } from '../../api/apiDataHooks/apiDataHooksTypes'
import { getQueryConfig } from '../../api/apiUtils'
import { fetchJson } from '../../api/fetchUtils'
import { queryClient } from '../../api/queryClient'

interface TokensPriceQueryProps extends SkipProp {
  symbols: string[]
  currency: string
  networkId: number
}

export type TokenPrice = {
  price: number
  symbol: string
}

export const tokensPriceQuery = ({ symbols, currency, networkId, skip }: TokensPriceQueryProps) =>
  queryOptions<TokenPrice[]>({
    // The symbols are intentionally left out of the query key so every price fetch shares one cache slot per
    // (currency, networkId). That buys three things: the persisted cache is restored on launch regardless of which
    // tokens have been discovered yet (no loader on every cold start), a growing symbol set is a cache hit refetched in
    // place rather than a miss that reloads, and invalidateTokenPrices() can target the slot by prefix after a tx. The
    // trade-off is that the cached array can lag the current symbol set, which is why worth loading is derived from data
    // completeness in useFetchListedFtsWorth instead of from this query's settled state.
    queryKey: ['tokenPrices', 'currentPrice', { currency, networkId }],
    refetchInterval: PRICES_REFRESH_INTERVAL,
    // When the user changes currency settings we don't want to keep the previous cache for too long.
    ...getQueryConfig({ gcTime: FIVE_MINUTES_MS, networkId }),
    queryFn: skip
      ? skipToken
      : async () => {
          try {
            const prices = await throttledClient.explorer.market.postMarketPrices({ currency }, symbols)

            // Map over the requested symbols, not the response, so we always return one entry per symbol. Worth loading
            // in useFetchListedFtsWorth treats a symbol with no entry as "still loading", so a short or reordered
            // response would otherwise leave a held token uncovered and deadlock its skeleton.
            return symbols.map((symbol, i) => ({ price: prices[i] ?? 0, symbol }))
          } catch (e) {
            if (is5XXError(e)) {
              const coingeckoIds = symbols.map(symbolToCoingeckoId).filter((id) => id !== '')
              const data = await queryClient.fetchQuery(coingeckoTokensPriceQuery({ ids: coingeckoIds, currency }))

              return symbols.map((symbol) => {
                const price = data[symbolToCoingeckoId(symbol)]

                return {
                  price: price?.[currency] ?? 0,
                  symbol
                }
              })
            } else {
              throw e
            }
          }
        }
  })

const coingeckoTokensPriceQuery = ({ ids, currency }: { ids: string[]; currency: string }) =>
  queryOptions({
    queryKey: ['tokenPrices', 'currentPrice', 'coingecko', ids, { currency }],
    queryFn: () =>
      fetchJson<Record<string, Record<string, number>>>(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=${currency}`
      )
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
