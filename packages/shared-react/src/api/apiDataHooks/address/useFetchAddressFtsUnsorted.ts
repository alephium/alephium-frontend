import { AddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { addressFtsQuery } from '../../../api/queries/addressQueries'
import { useIsNodeOnline, useNetworkId } from '../../../network/networkHooks'

export const useFetchAddressFtsUnsorted = (addressHash: AddressHash) => {
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()

  const { data, isLoading } = useQuery(addressFtsQuery({ addressHash, networkId, isNodeOnline }))

  return {
    data: useMemo(() => (data ? [...data.listedFts, ...data.unlistedFts] : []), [data]),
    isLoading
  }
}
