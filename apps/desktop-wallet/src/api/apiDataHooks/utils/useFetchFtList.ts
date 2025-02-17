import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { TokenList } from '@alephium/token-list'
import { useQuery } from '@tanstack/react-query'

import { ftListQuery } from '@/api/queries/tokenQueries'

export interface FTList {
  data: TokenList['tokens'] | undefined
  isLoading: boolean
}

type FTListProps = {
  skip: boolean
}

const useFetchFtList = (props?: FTListProps): FTList => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(ftListQuery({ networkId, skip: props?.skip }))

  // TODO: Maybe return an object instead of an array for faster search?
  return {
    data,
    isLoading
  }
}

export default useFetchFtList
