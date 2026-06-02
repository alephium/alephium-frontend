import { useQueries, UseQueryResult } from '@tanstack/react-query'

import { addressTokensBalancesQuery, AddressTokensBalancesQueryFnData } from '../../../api/queries/addressQueries'
import { useUnsortedAddressesHashes } from '../../../hooks/addresses/useUnsortedAddresses'
import { useIsNodeOnline, useNetworkId } from '../../../network/networkHooks'

export const useFetchWalletBalancesTokens = <T>(
  combine: (results: UseQueryResult<AddressTokensBalancesQueryFnData>[]) => {
    data: T
    isLoading: boolean
    isFetching?: boolean
    error?: boolean
  }
) => {
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()
  const allAddressHashes = useUnsortedAddressesHashes()

  const { data, isLoading, isFetching, error } = useQueries({
    queries: allAddressHashes.map((addressHash) =>
      addressTokensBalancesQuery({ addressHash, networkId, isNodeOnline })
    ),
    combine
  })

  return {
    data,
    isLoading,
    isFetching,
    error
  }
}
