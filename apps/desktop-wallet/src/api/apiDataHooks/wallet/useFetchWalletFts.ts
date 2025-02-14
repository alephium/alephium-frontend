import useFetchSortedFts from '@/api/apiDataHooks/utils/useFetchSortedFts'
import useFetchWalletTokensByType from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'

interface UseWalletFTsProps {
  sort: boolean
  includeHidden: boolean
}

const useFetchWalletFts = ({ sort, includeHidden }: UseWalletFTsProps) => {
  const {
    data: { listedFts, unlistedFtIds },
    isLoading: isLoadingTokensByType
  } = useFetchWalletTokensByType({ includeHidden })

  const { sortedListedFts, sortedUnlistedFts, isLoading } = useFetchSortedFts({
    listedFts,
    unlistedFtIds,
    skip: sort === false
  })

  return {
    listedFts: sortedListedFts,
    unlistedFts: sortedUnlistedFts,
    isLoading: isLoading || isLoadingTokensByType
  }
}

export default useFetchWalletFts
