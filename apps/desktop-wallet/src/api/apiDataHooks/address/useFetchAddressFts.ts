import { UseFetchAddressProps } from '@/api/apiDataHooks/address/addressApiDataHooksTypes'
import useFetchAddressTokensByType from '@/api/apiDataHooks/address/useFetchAddressTokensByType'
import useFetchSortedFts from '@/api/apiDataHooks/utils/useFetchSortedFts'

interface UseAddressFTsProps extends UseFetchAddressProps {
  sort?: boolean
}

const useFetchAddressFts = ({ addressHash, sort = true, skip }: UseAddressFTsProps) => {
  const {
    data: { listedFts, unlistedFtIds },
    isLoading: isLoadingTokensByType
  } = useFetchAddressTokensByType({ addressHash, skip, includeAlph: true })

  const { sortedListedFts, sortedUnlistedFts, isLoading } = useFetchSortedFts({
    listedFts,
    unlistedFtIds,
    skip: skip || !sort
  })

  return {
    listedFts: sortedListedFts,
    unlistedFts: sortedUnlistedFts,
    isLoading: isLoading || isLoadingTokensByType
  }
}

export default useFetchAddressFts
