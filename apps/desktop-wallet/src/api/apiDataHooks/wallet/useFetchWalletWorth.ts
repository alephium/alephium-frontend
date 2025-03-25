import useFetchListedFtsWorth from '@/api/apiDataHooks/utils/useFetchListedFtsWorth'
import useFetchTokensSeparatedByListing from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByListing'
import useMergeAllTokensBalances from '@/api/apiDataHooks/utils/useMergeAllTokensBalances'
import useFetchWalletBalancesAlph from '@/api/apiDataHooks/wallet/useFetchWalletBalancesAlph'
import useFetchWalletBalancesTokensArray from '@/api/apiDataHooks/wallet/useFetchWalletBalancesTokensArray'

const useFetchWalletWorth = () => {
  const {
    data: alphBalances,
    isLoading: isLoadingAlphBalances,
    isFetching: isFetchingAlphBalances,
    error: errorAlphBalances
  } = useFetchWalletBalancesAlph()
  const {
    data: tokensBalances,
    isLoading: isLoadingTokensBalances,
    isFetching: isFetchingTokensBalances,
    error: errorTokensBalances
  } = useFetchWalletBalancesTokensArray()
  const allTokensBalances = useMergeAllTokensBalances({
    includeAlph: true,
    alphBalances,
    tokensBalances
  })
  const {
    data: { listedFts },
    isLoading: isLoadingTokensByListing
  } = useFetchTokensSeparatedByListing(allTokensBalances)
  const { data: worth, isLoading: isLoadingWorth } = useFetchListedFtsWorth(listedFts)

  return {
    data: worth,
    isLoading: isLoadingWorth || isLoadingTokensByListing || isLoadingAlphBalances || isLoadingTokensBalances,
    isFetching: isFetchingAlphBalances || isFetchingTokensBalances,
    error: errorAlphBalances || errorTokensBalances
  }
}

export default useFetchWalletWorth
