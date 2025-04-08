import { ApiBalances, ListedFT } from '@alephium/shared'
import { orderBy } from 'lodash'
import { useMemo } from 'react'

import { useFetchTokenPrices } from '@/api/apiDataHooks/market/useFetchTokenPrices'
import { getTokenWorth } from '@/api/apiDataHooks/utils/getTokenWorth'

export const useFetchSortListedFtsByWorth = (listedFts: (ListedFT & ApiBalances)[]) => {
  const { data: tokenPrices, isLoading } = useFetchTokenPrices()

  const sortedListedFts = useMemo(
    () =>
      orderBy(listedFts, [(token) => getTokenWorth(token, tokenPrices) ?? -1, 'name', 'id'], ['desc', 'asc', 'asc']),
    [listedFts, tokenPrices]
  )

  return {
    data: sortedListedFts,
    isLoading
  }
}
