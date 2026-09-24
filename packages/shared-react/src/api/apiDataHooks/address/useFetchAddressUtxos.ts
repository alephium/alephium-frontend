import { AddressHash } from '@alephium/shared/types'
import { useQuery } from '@tanstack/react-query'

import { addressUtxosQuery } from '../../../api/queries/addressQueries'
import { useIsNodeOnline, useNetworkId } from '../../../network/networkHooks'

export const useFetchAddressUtxos = (addressHash: AddressHash) => {
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()

  const { data, isLoading } = useQuery(addressUtxosQuery({ addressHash, networkId, isNodeOnline }))

  return {
    data,
    isLoading
  }
}
