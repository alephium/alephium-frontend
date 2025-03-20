import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { nftQuery } from '@/api/queries/tokenQueries'
import { TokenId } from '@/types/tokens'

interface UseNFTProps extends SkipProp {
  id: TokenId
}

const useFetchNft = ({ id, skip }: UseNFTProps) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading, error } = useQuery(nftQuery({ id, networkId, skip }))

  return { data, isLoading, error }
}

export default useFetchNft
