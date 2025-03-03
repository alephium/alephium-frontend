import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'

import { tokenQuery } from '@/api/queries/tokenQueries'
import { TokenId } from '@/types/tokens'

const useFetchToken = (id: TokenId) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(tokenQuery({ id, networkId }))

  return {
    data,
    isLoading
  }
}

export default useFetchToken
