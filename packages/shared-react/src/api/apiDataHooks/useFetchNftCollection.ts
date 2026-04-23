import { matchesNFTCollectionUriMetaDataSchema, throttledClient } from '@alephium/shared'
import { addressFromContractId, NFTCollectionUriMetaData } from '@alephium/web3'
import { skipToken, useQuery } from '@tanstack/react-query'

import { getQueryConfig } from '../../api/apiUtils'
import { fetchJson } from '../../api/fetchUtils'
import { useCurrentlyOnlineNetworkId } from '../../network/useCurrentlyOnlineNetworkId'

export const useFetchNftCollection = (collectionId: string) => {
  const networkId = useCurrentlyOnlineNetworkId()

  const { data: nftCollectionMetadata, isLoading: isNftCollectionMetadataLoading } = useQuery({
    queryKey: ['nfts', 'nftCollection', 'nftCollectionMetadata', collectionId],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: !collectionId
      ? skipToken
      : async () =>
          (
            await throttledClient.explorer.tokens.postTokensNftCollectionMetadata([addressFromContractId(collectionId)])
          )[0] ?? null
  })

  const collectionUri = nftCollectionMetadata?.collectionUri
  const { data: nftCollectionData, isLoading: isNftCollectionDataLoading } = useQuery({
    queryKey: ['nfts', 'nftCollection', 'nftCollectionData', collectionId],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: !collectionUri
      ? skipToken
      : async () => {
          try {
            const data = await fetchJson<NFTCollectionUriMetaData>(collectionUri)

            return matchesNFTCollectionUriMetaDataSchema(data) ? data : null
          } catch (error) {
            console.error(error)
            return null
          }
        }
  })

  return {
    data: nftCollectionData,
    isLoading: isNftCollectionMetadataLoading || isNftCollectionDataLoading
  }
}
