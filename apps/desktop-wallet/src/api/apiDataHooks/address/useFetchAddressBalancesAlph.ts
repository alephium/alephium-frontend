import { useQuery } from '@tanstack/react-query'

import { UseFetchAddressProps } from '@/api/apiDataHooks/address/addressApiDataHooksTypes'
import { addressAlphBalancesQuery } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

const useFetchAddressBalancesAlph = ({ addressHash, skip }: UseFetchAddressProps) => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)

  const { data, isLoading } = useQuery(addressAlphBalancesQuery({ addressHash, networkId, skip }))

  return {
    data: data?.balances,
    isLoading
  }
}

export default useFetchAddressBalancesAlph
