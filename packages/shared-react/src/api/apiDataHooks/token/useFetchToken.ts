import { TokenId } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { tokenQuery } from '@/api/queries/tokenQueries'
import { useCurrentlyOnlineNetworkId } from '@/network'

export const useFetchToken = (id: TokenId) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(tokenQuery({ id, networkId }))

  return {
    data,
    isLoading
  }
}
