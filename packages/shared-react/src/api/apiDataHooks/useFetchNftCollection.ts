import { matchesNFTCollectionUriMetaDataSchema, throttledClient } from '@alephium/shared'
import { addressFromContractId, NFTCollectionUriMetaData } from '@alephium/web3'
import { skipToken, useQuery } from '@tanstack/react-query'
import axios from 'axios'

import { getQueryConfig } from '@/api'
import { useCurrentlyOnlineNetworkId } from '@/network/useCurrentlyOnlineNetworkId'

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
          const { data } = await axios.get(collectionUri)

          if (matchesNFTCollectionUriMetaDataSchema(data)) {
            return data as NFTCollectionUriMetaData
          } else {
            throw new Error(
              `Response does not match the NFT collection metadata schema. NFT collection URI: ${collectionUri}`
            )
          }
        }
  })

  return {
    data: nftCollectionData,
    isLoading: isNftCollectionMetadataLoading || isNftCollectionDataLoading
  }
}
