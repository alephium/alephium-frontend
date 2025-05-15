import { useQueries, UseQueryResult } from '@tanstack/react-query'

import { addressAlphBalancesQuery, AddressAlphBalancesQueryFnData } from '@/api/queries/addressQueries'
import { useUnsortedAddressesHashes } from '@/hooks/addresses/useUnsortedAddresses'
import { useCurrentlyOnlineNetworkId } from '@/network'

export const useFetchWalletBalancesAlphBase = <T>(
  combine: (results: UseQueryResult<AddressAlphBalancesQueryFnData>[]) => {
    data: T
    isLoading: boolean
    isFetching?: boolean
    error?: boolean
  }
) => {
  const networkId = useCurrentlyOnlineNetworkId()
  const allAddressHashes = useUnsortedAddressesHashes()

  const { data, isLoading, isFetching, error } = useQueries({
    queries: allAddressHashes.map((addressHash) => addressAlphBalancesQuery({ addressHash, networkId })),
    combine
  })

  return {
    data,
    isLoading,
    isFetching,
    error
  }
}
