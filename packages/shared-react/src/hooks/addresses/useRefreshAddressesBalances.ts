import { AddressHash } from '@alephium/shared/types'
import { notifyManager, Query } from '@tanstack/react-query'
import { useCallback, useMemo, useSyncExternalStore } from 'react'

import { ADDRESS_DATA } from '../../api/queries/addressQueries'
import { queryClient } from '../../api/queryClient'
import { invalidateAddressesQueries, invalidateTokenPrices } from '../../api/queryInvalidation'
import { useUnsortedAddressesHashesSet } from '../../hooks/addresses/useUnsortedAddresses'

export const useRefreshAddressesBalances = () => {
  const addressHashesSet = useUnsortedAddressesHashesSet()
  const isFetchingBalances = useIsFetchingAddressesBalances(addressHashesSet)

  const refreshBalances = useCallback(async () => {
    if (isFetchingBalances) return

    await invalidateAddressesQueries(addressHashesSet)
    await invalidateTokenPrices()
  }, [addressHashesSet, isFetchingBalances])

  return {
    refreshBalances,
    isFetchingBalances
  }
}

// Equivalent to useIsFetching({ predicate }) but with O(1) work per query cache event instead of a full cache scan,
// which is what useIsFetching does on every event for the lifetime of the subscribed component.
const useIsFetchingAddressesBalances = (addressHashesSet: Set<AddressHash>) => {
  const store = useMemo(() => {
    const fetchingQueryHashes = new Set<string>()

    const isBalanceQuery = (query: Query) =>
      query.queryKey[0] === 'address' &&
      query.queryKey[2] === ADDRESS_DATA &&
      query.queryKey[3] === 'balance' &&
      addressHashesSet.has(query.queryKey[1] as AddressHash)

    const compute = () => {
      fetchingQueryHashes.clear()

      for (const query of queryClient.getQueryCache().getAll()) {
        if (isBalanceQuery(query) && query.state.fetchStatus === 'fetching') fetchingQueryHashes.add(query.queryHash)
      }
    }

    compute()

    return {
      subscribe: (onStoreChange: () => void) => {
        const wasFetching = fetchingQueryHashes.size > 0
        compute()

        const notify = notifyManager.batchCalls(onStoreChange)
        const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
          if (!isBalanceQuery(event.query)) return

          const wasEmpty = fetchingQueryHashes.size === 0

          if (event.type !== 'removed' && event.query.state.fetchStatus === 'fetching') {
            fetchingQueryHashes.add(event.query.queryHash)
          } else {
            fetchingQueryHashes.delete(event.query.queryHash)
          }

          if (wasEmpty !== (fetchingQueryHashes.size === 0)) notify()
        })

        if (wasFetching !== fetchingQueryHashes.size > 0) onStoreChange()

        return unsubscribe
      },
      getSnapshot: () => fetchingQueryHashes.size > 0
    }
  }, [addressHashesSet])

  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
