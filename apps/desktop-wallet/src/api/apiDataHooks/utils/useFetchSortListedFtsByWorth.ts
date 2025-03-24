import { calculateAmountWorth } from '@alephium/shared'
import { isNumber, orderBy } from 'lodash'
import { useMemo } from 'react'

import useFetchTokenPrices from '@/api/apiDataHooks/market/useFetchTokenPrices'
import { TokenPrice } from '@/api/queries/priceQueries'
import { ApiBalances, ListedFT } from '@/types/tokens'

const useFetchSortListedFtsByWorth = (listedFts: (ListedFT & ApiBalances)[]) => {
  const { data: tokenPrices, isLoading } = useFetchTokenPrices({ skip: listedFts.length === 0 })

  const sortedListedFts = useMemo(
    () => orderBy(listedFts, [(token) => getTokenWorth(token, tokenPrices), 'name', 'id'], ['desc', 'asc', 'asc']),
    [listedFts, tokenPrices]
  )

  return {
    data: sortedListedFts,
    isLoading
  }
}

export default useFetchSortListedFtsByWorth

const getTokenWorth = (token: ListedFT & ApiBalances, tokenPrices?: TokenPrice[]) => {
  const tokenPrice = tokenPrices?.find((tokenPrice) => tokenPrice.symbol === token.symbol)?.price

  return isNumber(tokenPrice) ? calculateAmountWorth(BigInt(token.totalBalance), tokenPrice, token.decimals) : -1
}
