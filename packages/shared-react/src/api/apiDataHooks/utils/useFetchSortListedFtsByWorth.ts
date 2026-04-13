import { ApiBalances, ListedFT } from '@alephium/shared'
import { useMemo } from 'react'

import { useFetchTokenPrices } from '../../../api/apiDataHooks/market/useFetchTokenPrices'
import { getTokenWorth } from '../../../api/apiDataHooks/utils/getTokenWorth'

export const useFetchSortListedFtsByWorth = (listedFts: (ListedFT & ApiBalances)[]) => {
  const { data: tokenPrices, isLoading } = useFetchTokenPrices()

  const sortedListedFts = useMemo(
    () =>
      [...listedFts].sort((a, b) => {
        const worthA = getTokenWorth(a, tokenPrices) ?? -1
        const worthB = getTokenWorth(b, tokenPrices) ?? -1
        if (worthA !== worthB) return worthB - worthA

        const nameA = a.name ?? ''
        const nameB = b.name ?? ''
        if (nameA !== nameB) return nameA < nameB ? -1 : 1

        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
      }),
    [listedFts, tokenPrices]
  )

  return {
    data: sortedListedFts,
    isLoading
  }
}
