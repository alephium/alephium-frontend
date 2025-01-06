import { calculateAmountWorth } from '@alephium/shared'
import { isNumber } from 'lodash'
import { useMemo } from 'react'

import useFetchTokenPrices from '@/api/apiDataHooks/market/useFetchTokenPrices'
import { ApiBalances, ListedFT } from '@/types/tokens'

interface UseListedFtsWorthProps {
  listedFts: (ListedFT & ApiBalances)[]
}

const useFetchListedFtsWorth = ({ listedFts }: UseListedFtsWorthProps) => {
  const { data: tokenPrices, isLoading: isLoadingTokenPrices } = useFetchTokenPrices()

  const worth = useMemo(
    () =>
      listedFts.reduce((totalWorth, token) => {
        const tokenPrice = tokenPrices?.find(({ symbol }) => symbol === token.symbol)?.price
        const tokenWorth = isNumber(tokenPrice)
          ? calculateAmountWorth(BigInt(token.totalBalance), tokenPrice, token.decimals)
          : 0

        return totalWorth + tokenWorth
      }, 0),
    [tokenPrices, listedFts]
  )

  return {
    data: worth,
    isLoading: isLoadingTokenPrices
  }
}

export default useFetchListedFtsWorth
