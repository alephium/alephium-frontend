import { ApiBalances, calculateTokenAmountWorth, ListedFT } from '@alephium/shared'
import { isNumber } from 'lodash'

import { TokenPrice } from '@/api/queries/priceQueries'

export const getTokenWorth = (token: ListedFT & ApiBalances, tokenPrices?: TokenPrice[]) => {
  const tokenPrice = tokenPrices?.find((tokenPrice) => tokenPrice.symbol === token.symbol)?.price

  return isNumber(tokenPrice)
    ? calculateTokenAmountWorth(BigInt(token.totalBalance), tokenPrice, token.decimals)
    : undefined
}
