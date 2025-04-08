import { AddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { addressTokensByTypeQuery } from '@/api/queries/addressQueries'
import { useCurrentlyOnlineNetworkId } from '@/network'

export const useFetchAddressTokensByType = (addressHash: AddressHash) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(addressTokensByTypeQuery({ addressHash, networkId }))

  return {
    data: data ?? {
      listedFts: [],
      unlistedTokens: [],
      unlistedFtIds: [],
      nftIds: [],
      nstIds: []
    },
    isLoading
  }
}
