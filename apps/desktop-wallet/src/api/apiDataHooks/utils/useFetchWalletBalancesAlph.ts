import { useQueries, UseQueryResult } from '@tanstack/react-query'

import { addressAlphBalancesQuery, AddressAlphBalancesQueryFnData } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

const useFetchWalletBalancesAlph = <T>(
  combine: (results: UseQueryResult<AddressAlphBalancesQueryFnData>[]) => {
    data: T
    isLoading: boolean
    isFetching?: boolean
    error?: boolean
  }
) => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
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

export default useFetchWalletBalancesAlph
