import { TokenId } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { nftQuery } from '@/api/queries/tokenQueries'
import { useCurrentlyOnlineNetworkId } from '@/network'

interface UseNFTProps extends SkipProp {
  id: TokenId
}

export const useFetchNft = ({ id, skip }: UseNFTProps) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading, error } = useQuery(nftQuery({ id, networkId, skip }))

  return { data, isLoading, error }
}
