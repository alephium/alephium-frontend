import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'

import { UseFetchAddressProps } from '@/api/apiDataHooks/address/addressApiDataHooksTypes'
import { addressTokensByTypeQuery } from '@/api/queries/addressQueries'

const useFetchAddressTokensByType = ({ addressHash }: UseFetchAddressProps) => {
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
