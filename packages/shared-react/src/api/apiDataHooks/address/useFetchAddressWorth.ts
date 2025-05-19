import { AddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { useFetchListedFtsWorth } from '@/api/apiDataHooks/utils/useFetchListedFtsWorth'
import { addressBalancesByListingQuery } from '@/api/queries/addressQueries'
import { useCurrentlyOnlineNetworkId } from '@/network'

export const useFetchAddressWorth = (addressHash: AddressHash) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading: isLoadingBalances } = useQuery(addressBalancesByListingQuery({ addressHash, networkId }))
  const { data: worth, isLoading: isLoadingWorth } = useFetchListedFtsWorth(data?.listedFts ?? [])

  return {
    data: worth,
    isLoading: isLoadingWorth || isLoadingBalances
  }
}
