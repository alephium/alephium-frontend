import { useQueries, UseQueryResult } from '@tanstack/react-query'

import { addressTokensBalancesQuery, AddressTokensBalancesQueryFnData } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

export const useFetchWalletBalancesTokens = <T>(
  combine: (results: UseQueryResult<AddressTokensBalancesQueryFnData>[]) => {
    data: T
    isLoading: boolean
    isFetching?: boolean
    error?: boolean
  }
) => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
  const allAddressHashes = useUnsortedAddressesHashes()

  const { data, isLoading, isFetching, error } = useQueries({
    queries: allAddressHashes.map((addressHash) => addressTokensBalancesQuery({ addressHash, networkId })),
    combine
  })

  return {
    data,
    isLoading,
    isFetching,
    error
  }
}
