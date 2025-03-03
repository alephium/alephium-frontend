import { useIsFetching } from '@tanstack/react-query'
import { useCallback } from 'react'

import queryClient from '@/api/queryClient'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'

const useRefreshBalances = () => {
  const addressHashes = useUnsortedAddressesHashes()
  const isFetchingBalances =
    useIsFetching({
      queryKey: ['address'],
      predicate: (query) => {
        const secondSegment = query.queryKey[1]?.toString() ?? ''
        const thirdSegment = query.queryKey[2]?.toString() ?? ''

        return addressHashes.includes(secondSegment) && thirdSegment === 'balance'
      }
    }) > 0

  const refreshBalances = useCallback(() => {
    if (isFetchingBalances) return

    addressHashes.forEach((addressHash) => {
      queryClient.invalidateQueries({ queryKey: ['address', addressHash, 'balance'] })
    })
  }, [addressHashes, isFetchingBalances])

  return {
    refreshBalances,
    isFetchingBalances
  }
}

export default useRefreshBalances
