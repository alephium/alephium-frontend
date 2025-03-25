import { AddressHash } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'

import { addressLatestTransactionQuery } from '@/api/queries/transactionQueries'

const useFetchAddressLatestTransaction = (addressHash: AddressHash) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(addressLatestTransactionQuery({ addressHash, networkId }))

  return {
    data,
    isLoading
  }
}

export default useFetchAddressLatestTransaction
