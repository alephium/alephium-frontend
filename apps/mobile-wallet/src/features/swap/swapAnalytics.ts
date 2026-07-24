import { AnalyticsProps } from '@alephium/shared'

import { SwapQuote } from '~/features/swap/swapTypes'

const bucketUsdValue = (usd: number): string => {
  if (usd < 10) return '<10'
  if (usd < 100) return '10-100'
  if (usd < 1000) return '100-1k'
  if (usd < 10000) return '1k-10k'
  return '>10k'
}

const bucketPriceImpact = (pct: number): string => {
  if (pct < 1) return '<1%'
  if (pct < 5) return '1-5%'
  return '>5%'
}

// The privacy-safe dimensions shared by every swap funnel event: token symbols, pool type and
// slippage, plus bucketed USD size and price impact so no raw amount or address ever reaches analytics.
export const swapQuoteAnalyticsProps = (quote: SwapQuote): AnalyticsProps => {
  const usd = quote.inputToken.usdValue ? Number(quote.inputToken.usdValue) : undefined

  return {
    pool_type: quote.poolType,
    from_token: quote.inputToken.symbol,
    to_token: quote.outputToken.symbol,
    direction: quote.swapType,
    slippage_bps: quote.slippageBps,
    price_impact_bucket: bucketPriceImpact(quote.priceImpactPct),
    amount_usd_bucket: usd !== undefined && Number.isFinite(usd) ? bucketUsdValue(usd) : undefined
  }
}
