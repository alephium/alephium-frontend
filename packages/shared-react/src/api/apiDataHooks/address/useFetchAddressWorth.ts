import { AddressHash } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { useFetchListedFtsWorth } from '../../../api/apiDataHooks/utils/useFetchListedFtsWorth'
import { addressBalancesByListingQuery } from '../../../api/queries/addressQueries'
import { useIsNodeOnline, useNetworkId } from '../../../network/networkHooks'

export const useFetchAddressWorth = (addressHash: AddressHash) => {
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()

  const { data, isLoading: isLoadingBalances } = useQuery(
    addressBalancesByListingQuery({ addressHash, networkId, isNodeOnline })
  )
  const { data: worth, isLoading: isLoadingWorth } = useFetchListedFtsWorth(data?.listedFts ?? [])

  return {
    data: worth,
    isLoading: isLoadingWorth || isLoadingBalances
  }
}
