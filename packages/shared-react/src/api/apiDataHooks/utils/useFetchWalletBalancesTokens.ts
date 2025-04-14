import { useQueries, UseQueryResult } from '@tanstack/react-query'

import { addressTokensBalancesQuery, AddressTokensBalancesQueryFnData } from '@/api/queries/addressQueries'
import { useUnsortedAddressesHashes } from '@/hooks/addresses/useUnsortedAddresses'
import { useCurrentlyOnlineNetworkId } from '@/network'

export const useFetchWalletBalancesTokens = <T>(
  combine: (results: UseQueryResult<AddressTokensBalancesQueryFnData>[]) => {
    data: T
    isLoading: boolean
    isFetching?: boolean
    error?: boolean
  }
) => {
  const networkId = useCurrentlyOnlineNetworkId()
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
