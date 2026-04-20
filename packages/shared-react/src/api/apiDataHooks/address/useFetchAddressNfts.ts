import { AddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { addressNftsQuery } from '../../../api/queries'
import { useCurrentlyOnlineNetworkId } from '../../../network'

interface UseFetchAddressNftsProps {
  addressHash: AddressHash
  skip?: boolean
}

export const useFetchAddressNfts = ({ addressHash, skip }: UseFetchAddressNftsProps) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(addressNftsQuery({ addressHash, networkId, skip }))

  return { data, isLoading }
}
