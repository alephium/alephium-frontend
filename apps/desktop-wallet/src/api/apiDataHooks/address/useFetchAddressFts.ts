import { AddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import useFetchSortFtsByWorth from '@/api/apiDataHooks/utils/useFetchSortFtsByWorth'
import { addressFtsQuery } from '@/api/queries/addressQueries'

const useFetchAddressFts = (addressHash: AddressHash) => {
  const { data: addressFts, isLoading: isLoadingAddressFts } = useQuery(addressFtsQuery({ addressHash }))

  const prop = addressFts ?? { listedFts: [], unlistedFts: [] }
  const { sortedListedFts, sortedUnlistedFts, isLoading: isLoadingSortFts } = useFetchSortFtsByWorth(prop)

  return {
    listedFts: sortedListedFts,
    unlistedFts: sortedUnlistedFts,
    isLoading: isLoadingAddressFts || isLoadingSortFts
  }
}

export default useFetchAddressFts
