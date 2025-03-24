import { TokenId } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { useFetchWalletBalancesAlph } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlph'
import { useFetchWalletBalancesTokensArray } from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensArray'

interface UseFetchWalletSingleTokenBalancesProps extends SkipProp {
  tokenId: TokenId
}

export const useFetchWalletSingleTokenBalances = ({ tokenId }: UseFetchWalletSingleTokenBalancesProps) => {
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchWalletBalancesAlph()
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } = useFetchWalletBalancesTokensArray()

  const isALPH = tokenId === ALPH.id

  return {
    data: useMemo(
      () => (isALPH ? alphBalances : tokensBalances.find(({ id }) => id === tokenId)),
      [alphBalances, isALPH, tokenId, tokensBalances]
    ),
    isLoading: isALPH ? isLoadingAlphBalances : isLoadingTokensBalances
  }
}
