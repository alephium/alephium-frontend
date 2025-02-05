import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

import { combineDefined } from '@/api/apiDataHooks/apiDataHooksUtils'
import useFetchWalletTokensByType from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'
import { nftDataQuery, nftMetadataQuery } from '@/api/queries/tokenQueries'
import { TokenId } from '@/types/tokens'

const useFetchWalletNftsSearchStrings = () => {
  const networkId = useCurrentlyOnlineNetworkId()
  const {
    data: { nftIds },
    isLoading: isLoadingTokensByType
  } = useFetchWalletTokensByType({ includeAlph: true })

  const { data: nftsMetadata, isLoading: isLoadingNftsMetadata } = useQueries({
    queries: nftIds.map((id) => nftMetadataQuery({ id, networkId })),
    combine: combineDefined
  })

  const { data: nftsData, isLoading: isLoadingNftsData } = useQueries({
    queries: nftsMetadata.map(({ id, tokenUri }) =>
      nftDataQuery({ id, tokenUri, networkId, skip: isLoadingNftsMetadata })
    ),
    combine: combineDefined
  })

  const nftsSearchStringsByNftId = useMemo(
    () =>
      nftsData.reduce(
        (acc, { id, name }) => {
          acc[id] = `${id} ${name}`

          return acc
        },
        {} as Record<TokenId, string>
      ),
    [nftsData]
  )

  return {
    data: nftsSearchStringsByNftId,
    isLoading: isLoadingNftsMetadata || isLoadingNftsData || isLoadingTokensByType
  }
}

export default useFetchWalletNftsSearchStrings
