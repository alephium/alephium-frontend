import { useQueries } from '@tanstack/react-query'

import { combineDefined } from '@/api/apiDataHooks/apiDataHooksUtils'
import { useFetchSortListedFtsByWorth } from '@/api/apiDataHooks/utils/useFetchSortListedFtsByWorth'
import { useSortUnlistedFtsAlphabetically } from '@/api/apiDataHooks/utils/useSortUnlistedFtsAlphabetically'
import { useFetchWalletTokensByType } from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'
import { fungibleTokenMetadataQuery } from '@/api/queries/tokenQueries'
import { useCurrentlyOnlineNetworkId } from '@/network'

export const useFetchWalletFtsSorted = () => {
  const networkId = useCurrentlyOnlineNetworkId()
  const {
    data: { listedFts, unlistedFtIds },
    isLoading: isLoadingTokensByType
  } = useFetchWalletTokensByType({ includeHidden: false })

  const { data: sortedListedFts, isLoading: isLoadingSortFts } = useFetchSortListedFtsByWorth(listedFts)

  const { data: unlistedFts, isLoading: isLoadingUnlistedFTs } = useQueries({
    queries: unlistedFtIds.map((id) => fungibleTokenMetadataQuery({ id, networkId })),
    combine: combineDefined
  })

  const sortedUnlistedFts = useSortUnlistedFtsAlphabetically(unlistedFts ?? [])

  return {
    listedFts: sortedListedFts,
    unlistedFts: sortedUnlistedFts,
    isLoading: isLoadingSortFts || isLoadingUnlistedFTs || isLoadingTokensByType
  }
}
