import { AddressHash } from '@alephium/shared'

import useFetchAddressTokensByType from '@/api/apiDataHooks/address/useFetchAddressTokensByType'
import useFetchSortedFts from '@/api/apiDataHooks/utils/useFetchSortedFts'

const useFetchAddressFts = (addressHash: AddressHash) => {
  const {
    data: { listedFts, unlistedFtIds },
    isLoading: isLoadingTokensByType
  } = useFetchAddressTokensByType(addressHash)

  const { sortedListedFts, sortedUnlistedFts, isLoading } = useFetchSortedFts({
    listedFts,
    unlistedFtIds
  })

  return {
    listedFts: sortedListedFts,
    unlistedFts: sortedUnlistedFts,
    isLoading: isLoading || isLoadingTokensByType
  }
}

export default useFetchAddressFts
