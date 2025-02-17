import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQueries } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { flatMapCombine } from '@/api/apiDataHooks/apiDataHooksUtils'
import { addressLatestTransactionQuery } from '@/api/queries/transactionQueries'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'

const useFetchLatestTransactionOfEachAddress = (props?: SkipProp) => {
  const networkId = useCurrentlyOnlineNetworkId()
  const allAddressHashes = useUnsortedAddressesHashes()

  const { data, isLoading } = useQueries({
    queries: !props?.skip
      ? allAddressHashes.map((addressHash) => addressLatestTransactionQuery({ addressHash, networkId }))
      : [],
    combine: flatMapCombine
  })

  return {
    data,
    isLoading
  }
}

export default useFetchLatestTransactionOfEachAddress
