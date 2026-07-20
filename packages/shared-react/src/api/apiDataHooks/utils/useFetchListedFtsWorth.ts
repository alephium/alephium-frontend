import { ApiBalances, ListedFT } from '@alephium/shared/types'
import { useMemo } from 'react'

import { useFetchTokenPrices } from '../../../api/apiDataHooks/market/useFetchTokenPrices'
import { getTokenWorth } from '../../../api/apiDataHooks/utils/getTokenWorth'
import { TokenPrice } from '../../../api/queries/priceQueries'

export const useFetchListedFtsWorth = (listedFts: (ListedFT & ApiBalances)[]) => {
  const { data: tokenPrices, isLoading: isLoadingTokenPrices, error } = useFetchTokenPrices()

  const worth = useMemo(
    () => listedFts.reduce((totalWorth, token) => totalWorth + (getTokenWorth(token, tokenPrices) ?? 0), 0),
    [tokenPrices, listedFts]
  )

  return {
    data: worth,
    error,
    isLoading: isLoadingTokenPrices || (!error && hasMissingTokenPrices(listedFts, tokenPrices))
  }
}

// The tokenPrices query key omits the symbols on purpose, so while token discovery is still growing the symbol set the
// cached price array can be a settled response for an older, smaller set. Computing worth from it flashes a wrong
// value, so incomplete coverage must count as loading. An entry with a 0 or null price still counts as covered since
// the API returns one entry per requested symbol.
export const hasMissingTokenPrices = (listedFts: Pick<ListedFT, 'symbol'>[], tokenPrices?: TokenPrice[]) =>
  listedFts.some(({ symbol }) => !tokenPrices?.some((tokenPrice) => tokenPrice.symbol === symbol))
