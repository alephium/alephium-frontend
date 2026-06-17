import { AddressHash } from '@alephium/shared/types'
import { useQuery } from '@tanstack/react-query'

import { addressTokensBalancesQuery } from '../../../api/queries/addressQueries'
import { useIsNodeOnline, useNetworkId } from '../../../network/networkHooks'

export const useFetchAddressBalancesTokens = (addressHash: AddressHash) => {
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()

  const { data, isLoading } = useQuery(addressTokensBalancesQuery({ addressHash, networkId, isNodeOnline }))

  return {
    data: data?.balances,
    isLoading
  }
}
