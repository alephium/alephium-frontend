import { AddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { addressTokensBalancesQuery } from '@/api/queries/addressQueries'
import { useCurrentlyOnlineNetworkId } from '@/network'

export const useFetchAddressBalancesTokens = (addressHash: AddressHash) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(addressTokensBalancesQuery({ addressHash, networkId }))

  return {
    data: data?.balances,
    isLoading
  }
}
