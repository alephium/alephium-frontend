import { ApiBalances, ListedFT } from '@alephium/shared/types'
import { useEffect, useMemo, useState } from 'react'

import { useFetchTokenPrices } from '../../../api/apiDataHooks/market/useFetchTokenPrices'
import { getTokenWorth } from '../../../api/apiDataHooks/utils/getTokenWorth'
import { TokenPrice } from '../../../api/queries/priceQueries'

export const useFetchListedFtsWorth = (listedFts: (ListedFT & ApiBalances)[]) => {
  const { data: tokenPrices, isLoading: isLoadingTokenPrices, error } = useFetchTokenPrices()

  const worth = useMemo(
    () => listedFts.reduce((totalWorth, token) => totalWorth + (getTokenWorth(token, tokenPrices) ?? 0), 0),
    [tokenPrices, listedFts]
  )

  const isWorthIncomplete = isLoadingTokenPrices || (!error && hasMissingTokenPrices(listedFts, tokenPrices))

  // Once a fully-priced worth has been shown, keep displaying it and update it in place instead of dropping back to the
  // skeleton while price coverage is momentarily incomplete - e.g. right after a wallet switch, where the persisted
  // cache already holds a value to show. The skeleton is only for the first load, before any worth exists.
  const [settledWorth, setSettledWorth] = useState<number>()

  useEffect(() => {
    if (!isWorthIncomplete) setSettledWorth(worth)
  }, [isWorthIncomplete, worth])

  const hasSettledWorth = settledWorth !== undefined

  return {
    data: isWorthIncomplete && hasSettledWorth ? settledWorth : worth,
    error,
    isLoading: isWorthIncomplete && !hasSettledWorth
  }
}

// A held token whose symbol has no entry in the cached price array. The tokenPrices query key omits the symbols on
// purpose, so the cached array can be a settled response for an older, smaller symbol set. An entry with a 0 or null
// price still counts as covered since the API returns one entry per requested symbol.
export const hasMissingTokenPrices = (listedFts: Pick<ListedFT, 'symbol'>[], tokenPrices?: TokenPrice[]) =>
  listedFts.some(({ symbol }) => !tokenPrices?.some((tokenPrice) => tokenPrice.symbol === symbol))
