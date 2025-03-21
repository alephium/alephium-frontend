import { AddressHash } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'

import { addressTokensByTypeQuery } from '@/api/queries/addressQueries'

const useFetchAddressTokensByType = (addressHash: AddressHash) => {
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

export default useFetchAddressTokensByType
