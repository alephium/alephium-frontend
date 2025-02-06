import useMergeAllTokensBalances from '@/api/apiDataHooks/utils/useMergeAllTokensBalances'
import useFetchWalletBalancesAlph from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlph'
import useFetchWalletBalancesTokensArray from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensArray'

interface UseFetchWalletBalancesProps {
  includeAlph?: boolean
}

const useFetchWalletBalances = (props?: UseFetchWalletBalancesProps) => {
  const includeAlph = props?.includeAlph ?? true

  const { data: alphBalances, isLoading: isLoadingAlphBalances } = useFetchWalletBalancesAlph()
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
