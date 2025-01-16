import { calculateAmountWorth } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useMemo } from 'react'

import { useFetchTokenPrice } from '@/api/apiDataHooks/market/useFetchTokenPrices'
import useFetchWalletBalancesAlphArray from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphArray'

const useFetchWalletWorthAlph = () => {
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchWalletBalancesAlphArray()
  const { data: alphPrice, isLoading: isLoadingAlphPrice } = useFetchTokenPrice(ALPH.symbol)

  return {
    data: useMemo(
      () => calculateAmountWorth(BigInt(alphBalances?.totalBalance ?? 0), alphPrice ?? 0, ALPH.decimals),
      [alphBalances?.totalBalance, alphPrice]
    ),
    isLoading: isLoadingAlphBalances || isLoadingAlphPrice
  }
}

export default useFetchWalletWorthAlph
