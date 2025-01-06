import { useQuery } from '@tanstack/react-query'

import { UseFetchAddressProps } from '@/api/apiDataHooks/address/addressApiDataHooksTypes'
import { addressTokensBalancesQuery } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

const useFetchAddressBalancesTokens = ({ addressHash, skip }: UseFetchAddressProps) => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)

  const { data, isLoading } = useQuery(addressTokensBalancesQuery({ addressHash, networkId, skip }))

  return {
    data: data?.balances,
    isLoading
  }
}

export default useFetchAddressBalancesTokens
