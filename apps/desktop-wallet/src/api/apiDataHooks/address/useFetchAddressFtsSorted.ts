import { AddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import useFetchSortListedFtsByWorth from '@/api/apiDataHooks/utils/useFetchSortListedFtsByWorth'
import useSortUnlistedFtsAlphabetically from '@/api/apiDataHooks/utils/useSortUnlistedFtsAlphabetically'
import { addressFtsQuery } from '@/api/queries/addressQueries'

const useFetchAddressFtsSorted = (addressHash: AddressHash) => {
  const { data: addressFts, isLoading: isLoadingAddressFts } = useQuery(addressFtsQuery({ addressHash }))
  const { data: sortedListedFts, isLoading: isLoadingSortFts } = useFetchSortListedFtsByWorth(
    addressFts?.listedFts ?? []
  )
  const sortedUnlistedFts = useSortUnlistedFtsAlphabetically(addressFts?.unlistedFts ?? [])

  return {
    listedFts: sortedListedFts,
    unlistedFts: sortedUnlistedFts,
    isLoading: isLoadingAddressFts || isLoadingSortFts
  }
}

export default useFetchAddressFtsSorted
