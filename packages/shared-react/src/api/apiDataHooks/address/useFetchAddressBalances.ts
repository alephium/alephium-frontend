import { AddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { addressBalancesQuery } from '@/api/queries/addressQueries'
import { useCurrentlyOnlineNetworkId } from '@/network'

export const useFetchAddressBalances = (addressHash: AddressHash) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(addressBalancesQuery({ addressHash, networkId }))

  return {
    data: data?.balances,
    isLoading
  }
}
