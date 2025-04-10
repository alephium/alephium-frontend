import { AssetAmount, calculateTokenAmountWorth } from '@alephium/shared'
import { isNumber } from 'lodash'

import { useFetchTokenPrices } from '@/api/apiDataHooks/market/useFetchTokenPrices'
import { useFetchTokensSeparatedByType } from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByType'

export const useFetchTokensAmountsWorth = (assetAmounts: Array<AssetAmount>) => {
  const {
    data: { listedFts },
    isLoading: isLoadingTokensByType
  } = useFetchTokensSeparatedByType(assetAmounts)

  const { data: tokenPrices, isLoading: isLoadingTokenPrices } = useFetchTokenPrices()

  const totalWorth = listedFts.reduce((totalWorth, token) => {
    const tokenPrice = tokenPrices?.find(({ symbol }) => symbol === token.symbol)?.price
    const tokenAmount = assetAmounts.find((asset) => asset.id === token.id)?.amount
    const tokenWorth =
      isNumber(tokenPrice) && tokenAmount !== undefined
        ? calculateTokenAmountWorth(tokenAmount, tokenPrice, token.decimals)
        : 0

    return totalWorth + tokenWorth
  }, 0)

  return {
    data: totalWorth,
    isLoading: isLoadingTokensByType || isLoadingTokenPrices
  }
}
