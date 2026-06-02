import { AddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { addressTokensByTypeQuery } from '../../../api/queries/addressQueries'
import { useIsNodeOnline, useNetworkId } from '../../../network'

export const useFetchAddressTokensByType = (addressHash: AddressHash) => {
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()

  const { data, isLoading } = useQuery(addressTokensByTypeQuery({ addressHash, networkId, isNodeOnline }))

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
