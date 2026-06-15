import { AddressHash } from '@alephium/shared/types'
import { useQuery } from '@tanstack/react-query'

import { addressBalancesQuery } from '../../../api/queries/addressQueries'
import { useIsNodeOnline, useNetworkId } from '../../../network/networkHooks'

export const useFetchAddressBalances = (addressHash: AddressHash) => {
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()

  const { data, isLoading } = useQuery(addressBalancesQuery({ addressHash, networkId, isNodeOnline }))

  return {
    data: data?.balances,
    isLoading
  }
}
