import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'

import { UseFetchAddressProps } from '@/api/apiDataHooks/address/addressApiDataHooksTypes'
import { addressLatestTransactionQuery } from '@/api/queries/transactionQueries'

const useFetchAddressLatestTransaction = ({ addressHash, skip }: UseFetchAddressProps) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(addressLatestTransactionQuery({ addressHash, networkId, skip }))

  return {
    data,
    isLoading
  }
}

export default useFetchAddressLatestTransaction
