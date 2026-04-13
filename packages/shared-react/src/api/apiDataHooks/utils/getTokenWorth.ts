import { ApiBalances, calculateTokenAmountWorth, ListedFT } from '@alephium/shared'

import { TokenPrice } from '../../../api/queries/priceQueries'

export const getTokenWorth = (token: ListedFT & ApiBalances, tokenPrices?: TokenPrice[]) => {
  const tokenPrice = tokenPrices?.find((tokenPrice) => tokenPrice.symbol === token.symbol)?.price

  return typeof tokenPrice === 'number'
    ? calculateTokenAmountWorth(BigInt(token.totalBalance), tokenPrice, token.decimals)
    : undefined
}
