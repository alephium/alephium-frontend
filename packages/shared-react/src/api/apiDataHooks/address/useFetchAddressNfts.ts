import { AddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { addressNftsQuery } from '@/api/queries'
import { useCurrentlyOnlineNetworkId } from '@/network'

export const useFetchAddressNfts = (addressHash: AddressHash) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(addressNftsQuery({ addressHash, networkId }))

  return { data, isLoading }
}
