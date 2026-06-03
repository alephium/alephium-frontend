import { TokenId } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { tokenQuery } from '../../../api/queries/tokenQueries'
import { useIsExplorerOnline, useNetworkId } from '../../../network/networkHooks'

export const useFetchToken = (id: TokenId, skipCaching?: boolean) => {
  const networkId = useNetworkId()
  const isExplorerOnline = useIsExplorerOnline()

  const { data, isLoading } = useQuery(tokenQuery({ id, networkId, skipCaching, isExplorerOnline }))

  return {
    data,
    isLoading
  }
}
