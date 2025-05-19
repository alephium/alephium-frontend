import { useQueries } from '@tanstack/react-query'

import { flatMapCombine } from '@/api/apiDataHooks/apiDataHooksUtils'
import { addressLatestTransactionQuery } from '@/api/queries/transactionQueries'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import { useCurrentlyOnlineNetworkId } from '@/network'

export const useFetchLatestTransactionOfEachAddress = () => {
  const networkId = useCurrentlyOnlineNetworkId()
  const addressHashes = useUnsortedAddressesHashes()

  const { data, isLoading } = useQueries({
    queries: addressHashes.map((addressHash) => addressLatestTransactionQuery({ addressHash, networkId })),
    combine: flatMapCombine
  })

  return {
    data,
    isLoading
  }
}
