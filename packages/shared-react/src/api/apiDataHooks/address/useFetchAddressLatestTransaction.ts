import { AddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { addressLatestTransactionQuery } from '@/api/queries/transactionQueries'
import { useCurrentlyOnlineNetworkId } from '@/network'

export const useFetchAddressLatestTransaction = (addressHash: AddressHash) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(addressLatestTransactionQuery({ addressHash, networkId }))

  return {
    data,
    isLoading
  }
}
