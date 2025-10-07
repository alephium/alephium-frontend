import { TokenId } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { tokenQuery } from '@/api/queries/tokenQueries'
import { useCurrentlyOnlineNetworkId, useIsExplorerOffline } from '@/network'

export const useFetchToken = (id: TokenId, skipCaching?: boolean) => {
  const networkId = useCurrentlyOnlineNetworkId()
  const isExplorerOffline = useIsExplorerOffline()

  const { data, isLoading } = useQuery(tokenQuery({ id, networkId, skipCaching, isExplorerOffline }))

  return {
    data,
    isLoading
  }
}
