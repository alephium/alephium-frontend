import { AddressHash } from '@alephium/shared/types'
import { useQuery } from '@tanstack/react-query'

import { addressNftsQuery } from '../../../api/queries'
import { useIsNodeOnline, useNetworkId } from '../../../network/networkHooks'

interface UseFetchAddressNftsProps {
  addressHash: AddressHash
  skip?: boolean
}

export const useFetchAddressNfts = ({ addressHash, skip }: UseFetchAddressNftsProps) => {
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()

  const { data, isLoading } = useQuery(addressNftsQuery({ addressHash, networkId, isNodeOnline, skip }))

  return { data, isLoading }
}
