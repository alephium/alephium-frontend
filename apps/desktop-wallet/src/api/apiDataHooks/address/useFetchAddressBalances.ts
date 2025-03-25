import { AddressHash } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'

import { addressBalancesQuery } from '@/api/queries/addressQueries'

const useFetchAddressBalances = (addressHash: AddressHash) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(addressBalancesQuery({ addressHash, networkId }))

  return {
    data: data?.balances,
    isLoading
  }
}

export default useFetchAddressBalances
