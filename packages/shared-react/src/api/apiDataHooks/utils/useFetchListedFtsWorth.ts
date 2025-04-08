import { ApiBalances, ListedFT } from '@alephium/shared'
import { useMemo } from 'react'

import { useFetchTokenPrices } from '@/api/apiDataHooks/market/useFetchTokenPrices'
import { getTokenWorth } from '@/api/apiDataHooks/utils/getTokenWorth'

export const useFetchListedFtsWorth = (listedFts: (ListedFT & ApiBalances)[]) => {
  const { data: tokenPrices, isLoading: isLoadingTokenPrices } = useFetchTokenPrices()

  const worth = useMemo(
    () => listedFts.reduce((totalWorth, token) => totalWorth + (getTokenWorth(token, tokenPrices) ?? 0), 0),
    [tokenPrices, listedFts]
  )

  return {
    data: worth,
    isLoading: isLoadingTokenPrices
  }
}
