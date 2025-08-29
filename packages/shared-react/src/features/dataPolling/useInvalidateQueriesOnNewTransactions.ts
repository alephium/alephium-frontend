import { AddressHash } from '@alephium/shared'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { useEffect } from 'react'

import { addressLatestTransactionQuery, AddressLatestTransactionQueryFnData } from '@/api/queries/transactionQueries'
import { invalidateAddressQueries, invalidateWalletQueries } from '@/api/queryInvalidation'
import { useUnsortedAddressesHashes } from '@/hooks/addresses/useUnsortedAddresses'
import { useCurrentlyOnlineNetworkId } from '@/network/useCurrentlyOnlineNetworkId'

export const useInvalidateQueriesOnNewTransactions = () => {
  const addressHashes = useUnsortedAddressesHashes()
  const networkId = useCurrentlyOnlineNetworkId()

  const { data } = useQueries({
    queries: addressHashes.map((addressHash) => addressLatestTransactionQuery({ addressHash, networkId })),
    combine: combineFn
  })

  useEffect(() => {
    if (!data) return

    Promise.allSettled(data.map(invalidateAddressQueries))
    invalidateWalletQueries()
  }, [data])
}

const combineFn = (results: UseQueryResult<AddressLatestTransactionQueryFnData>[]) => {
  const addressesWithNewTxs = results.reduce((acc, result) => {
    if (result.data && result.data.latestTx?.hash !== result.data.previousTxHash) {
      acc.push(result.data.addressHash)
    }

    return acc
  }, [] as Array<AddressHash>)

  return {
    data: addressesWithNewTxs
  }
}
