import { TokenId } from '@alephium/shared/types'
import { useQuery } from '@tanstack/react-query'

import { SkipProp } from '../../../api/apiDataHooks/apiDataHooksTypes'
import { nftQuery } from '../../../api/queries/tokenQueries'
import { useIsExplorerOnline, useNetworkId } from '../../../network/networkHooks'

interface UseNFTProps extends SkipProp {
  id: TokenId
}

export const useFetchNft = ({ id, skip }: UseNFTProps) => {
  const networkId = useNetworkId()
  const isExplorerOnline = useIsExplorerOnline()

  const { data, isLoading, error } = useQuery(nftQuery({ id, networkId, isExplorerOnline, skip }))

  return { data, isLoading, error }
}
