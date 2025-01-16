import useFetchSortedFts from '@/api/apiDataHooks/utils/useFetchSortedFts'
import useFetchWalletTokensByType from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'

interface UseWalletFTsProps {
  sort: boolean
}

const useFetchWalletFts = (props?: UseWalletFTsProps) => {
  const {
    data: { listedFts, unlistedFtIds },
    isLoading: isLoadingTokensByType
  } = useFetchWalletTokensByType({ includeAlph: true })

  const { sortedListedFts, sortedUnlistedFts, isLoading } = useFetchSortedFts({
    listedFts,
    unlistedFtIds,
    skip: props?.sort === false
  })

  return {
    listedFts: sortedListedFts,
    unlistedFts: sortedUnlistedFts,
    isLoading: isLoading || isLoadingTokensByType
  }
}

export default useFetchWalletFts
