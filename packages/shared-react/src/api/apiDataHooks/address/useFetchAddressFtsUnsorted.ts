import { AddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { addressFtsQuery } from '@/api/queries/addressQueries'
import { useCurrentlyOnlineNetworkId } from '@/network/useCurrentlyOnlineNetworkId'

export const useFetchAddressFtsUnsorted = (addressHash: AddressHash) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(addressFtsQuery({ addressHash, networkId }))

  return {
    data: useMemo(() => (data ? [...data.listedFts, ...data.unlistedFts] : []), [data]),
    isLoading
  }
}
