import useMergeAllTokensBalances from '@/api/apiDataHooks/utils/useMergeAllTokensBalances'
import useFetchWalletBalancesAlphArray from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlphArray'
import useFetchWalletBalancesTokensArray from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensArray'

interface UseFetchWalletBalancesProps {
  includeAlph?: boolean
}

const useFetchWalletBalances = (props?: UseFetchWalletBalancesProps) => {
  const includeAlph = props?.includeAlph ?? true

  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchWalletBalancesAlphArray()
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } = useFetchWalletBalancesTokensArray()
  const allTokensBalances = useMergeAllTokensBalances({
    includeAlph,
    alphBalances,
    tokensBalances
  })

  return {
    data: allTokensBalances,
    isLoading: isLoadingTokensBalances || (includeAlph ? isLoadingAlphBalances : false)
  }
}

export default useFetchWalletBalances
