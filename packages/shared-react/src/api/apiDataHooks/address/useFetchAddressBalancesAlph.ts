import { useQuery } from '@tanstack/react-query'

import { UseFetchAddressProps } from '@/api/apiDataHooks/address/addressApiDataHooksTypes'
import { addressAlphBalancesQuery } from '@/api/queries/addressQueries'
import { useCurrentlyOnlineNetworkId } from '@/network'

export const useFetchAddressBalancesAlph = ({ addressHash, skip }: UseFetchAddressProps) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(addressAlphBalancesQuery({ addressHash, networkId, skip }))

  return {
    data: data?.balances,
    isLoading
  }
}
