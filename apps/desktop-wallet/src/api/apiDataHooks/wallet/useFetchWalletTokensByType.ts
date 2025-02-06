import { useMemo } from 'react'

import useFetchTokensSeparatedByType from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByType'
import useMergeAllTokensBalances from '@/api/apiDataHooks/utils/useMergeAllTokensBalances'
import useFetchWalletBalancesAlph from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlph'
import useFetchWalletBalancesTokensArray from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensArray'
import { useAppSelector } from '@/hooks/redux'

interface UseFetchWalletTokensByType {
  includeAlph: boolean
  includeHidden?: boolean
}

const useFetchWalletTokensByType = ({ includeAlph, includeHidden = true }: UseFetchWalletTokensByType) => {
  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchWalletBalancesAlph()
  const { data: _tokensBalances, isLoading: isLoadingTokensBalances } = useFetchWalletBalancesTokensArray()
  const hiddenTokenIds = useAppSelector((s) => s.hiddenTokens.hiddenTokensIds)
  const tokensBalances = useMemo(
    () => (includeHidden ? _tokensBalances : _tokensBalances.filter((token) => !hiddenTokenIds.includes(token.id))),
    [includeHidden, _tokensBalances, hiddenTokenIds]
  )
  const allTokensBalances = useMergeAllTokensBalances({
    includeAlph,
    alphBalances,
    tokensBalances
  })
  const { data, isLoading } = useFetchTokensSeparatedByType(allTokensBalances)

  return {
    data,
    isLoading: isLoading || isLoadingTokensBalances || (includeAlph ? isLoadingAlphBalances : false)
  }
}

export default useFetchWalletTokensByType
