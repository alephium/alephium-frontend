import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { nftDataQuery, nftMetadataQuery } from '@/api/queries/tokenQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'
import { TokenId } from '@/types/tokens'

interface UseNFTProps extends SkipProp {
  id: TokenId
}

const useFetchNft = ({ id, skip }: UseNFTProps) => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
  const { data: nftMetadata, isLoading: isLoadingNftMetadata } = useQuery(nftMetadataQuery({ id, networkId, skip }))

  const {
    data: nftData,
    isLoading: isLoadingNftData,
    error
  } = useQuery(nftDataQuery({ id, tokenUri: nftMetadata?.tokenUri, networkId, skip: skip || isLoadingNftMetadata }))

  return {
    data: useMemo(
      () =>
        !!nftMetadata && !!nftData
          ? {
              ...nftMetadata,
              ...nftData
            }
          : undefined,
      [nftData, nftMetadata]
    ),
    isLoading: isLoadingNftMetadata || isLoadingNftData,
    error,
    nftMetadata
  }
}

export default useFetchNft
