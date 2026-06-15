import { calculateTokenAmountWorth } from '@alephium/shared/numbers'
import { ALPH } from '@alephium/token-list'

import { useFetchTokenPrice } from '../../../api/apiDataHooks/market/useFetchTokenPrices'

export const useFetchFeeWorth = (fee: bigint) => {
  const { data: alphPrice, isLoading } = useFetchTokenPrice(ALPH.symbol)

  const feeWorth = alphPrice ? calculateTokenAmountWorth(fee, alphPrice, ALPH.decimals) : 0

  return {
    data: feeWorth,
    isLoading
  }
}
