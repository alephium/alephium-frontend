import { useQuery } from '@tanstack/react-query'

import { UseFetchAddressProps } from '../../../api/apiDataHooks/address/addressApiDataHooksTypes'
import { addressAlphBalancesQuery } from '../../../api/queries/addressQueries'
import { useIsNodeOnline, useNetworkId } from '../../../network/networkHooks'

export const useFetchAddressBalancesAlph = ({ addressHash }: UseFetchAddressProps) => {
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()

  const { data, isLoading } = useQuery(
    addressAlphBalancesQuery({ addressHash, networkId, isNodeOnline, skip: !addressHash })
  )

  return {
    data: data?.balances,
    isLoading
  }
}
