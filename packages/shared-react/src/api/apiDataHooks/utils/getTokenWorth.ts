import { calculateTokenAmountWorth } from '@alephium/shared/numbers'
import { ApiBalances, ListedFT } from '@alephium/shared/types'

import { TokenPrice } from '../../../api/queries/priceQueries'

export const getTokenWorth = (token: ListedFT & ApiBalances, tokenPrices?: TokenPrice[]) => {
  const tokenPrice = tokenPrices?.find((tokenPrice) => tokenPrice.symbol === token.symbol)?.price

  return typeof tokenPrice === 'number'
    ? calculateTokenAmountWorth(BigInt(token.totalBalance), tokenPrice, token.decimals)
    : undefined
}
