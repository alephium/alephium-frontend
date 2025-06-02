import { useQuery } from '@tanstack/react-query'

import { addressTransactionsCountQuery } from '@/api/queries'
import { useCurrentlyOnlineNetworkId } from '@/network'

export const useFetchAddressTransactionsCount = (addressStr: string) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(addressTransactionsCountQuery({ addressHash: addressStr, networkId }))

  return {
    data,
    isLoading
  }
}
