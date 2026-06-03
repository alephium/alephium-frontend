import { useQueries } from '@tanstack/react-query'

import { flatMapCombine } from '../../../api/apiDataHooks/apiDataHooksUtils'
import { addressLatestTransactionQuery } from '../../../api/queries/transactionQueries'
import { useUnsortedAddressesHashes } from '../../../hooks/addresses/useUnsortedAddresses'
import { useIsExplorerOnline, useNetworkId } from '../../../network/networkHooks'

export const useFetchLatestTransactionOfEachAddress = () => {
  const networkId = useNetworkId()
  const isExplorerOnline = useIsExplorerOnline()
  const addressHashes = useUnsortedAddressesHashes()

  const { data, isLoading } = useQueries({
    queries: addressHashes.map((addressHash) =>
      addressLatestTransactionQuery({ addressHash, networkId, isExplorerOnline })
    ),
    combine: flatMapCombine
  })

  return {
    data,
    isLoading
  }
}
