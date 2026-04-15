import { useQuery } from '@tanstack/react-query'

import { UseFetchAddressProps } from '../../../api/apiDataHooks/address/addressApiDataHooksTypes'
import { addressAlphBalancesQuery } from '../../../api/queries/addressQueries'
import { useCurrentlyOnlineNetworkId } from '../../../network'

export const useFetchAddressBalancesAlph = ({ addressHash }: UseFetchAddressProps) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading, isFetching } = useQuery(
    addressAlphBalancesQuery({ addressHash, networkId, skip: !addressHash })
  )

  return {
    data: data?.balances,
    isLoading,
    isFetching
  }
}
