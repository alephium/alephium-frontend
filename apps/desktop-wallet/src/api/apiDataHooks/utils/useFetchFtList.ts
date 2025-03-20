import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'

import { ftListQuery } from '@/api/queries/tokenQueries'
import { FtListMap } from '@/types/tokens'

export interface FTList {
  data: FtListMap | undefined
  isLoading: boolean
}

type FTListProps = {
  skip: boolean
}

const useFetchFtList = (props?: FTListProps): FTList => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQuery(ftListQuery({ networkId, skip: props?.skip }))

  return {
    data,
    isLoading
  }
}

export default useFetchFtList
