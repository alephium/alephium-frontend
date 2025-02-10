import { batchers, ONE_DAY_MS } from '@alephium/shared'
import { getQueryConfig } from '@alephium/shared-react'
import { explorer as e, NFTMetaData, NFTTokenUriMetaData } from '@alephium/web3'
import { queryOptions, skipToken, UseQueryResult } from '@tanstack/react-query'
import axios from 'axios'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { convertTokenDecimalsToNumber, matchesNFTTokenUriMetaDataSchema } from '@/api/apiUtils'
import { TokenId } from '@/types/tokens'

export type TokenTypesQueryFnData = Record<e.TokenStdInterfaceId, TokenId[]>

export const StdInterfaceIds = Object.values(e.TokenStdInterfaceId)

interface TokenQueryProps extends SkipProp {
  id: TokenId
  networkId?: number
}

interface NFTQueryProps extends TokenQueryProps {
  tokenUri?: NFTMetaData['tokenUri']
}

enum NFTDataTypes {
  image = 'image',
  video = 'video',
  audio = 'audio',
  other = 'other'
}

type NFTDataType = keyof typeof NFTDataTypes

export const tokenTypeQuery = ({ id, networkId, skip }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'type', id],
    // We always want to remember the type of a token, even when user navigates for too long from components that use
    // tokens.
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn:
      !skip && networkId !== undefined
        ? async () => {
            const tokenInfo = await batchers.tokenTypeBatcher.fetch(id)

            return tokenInfo?.stdInterfaceId
              ? { ...tokenInfo, stdInterfaceId: tokenInfo.stdInterfaceId as e.TokenStdInterfaceId }
              : null
          }
        : skipToken
  })

export const combineTokenTypeQueryResults = (results: UseQueryResult<e.TokenInfo | null>[]) => ({
  data: results.reduce(
    (tokenIdsByType, { data: tokenInfo }) => {
      if (!tokenInfo) return tokenIdsByType
      const stdInterfaceId = tokenInfo.stdInterfaceId as e.TokenStdInterfaceId

      if (StdInterfaceIds.includes(stdInterfaceId)) {
        tokenIdsByType[stdInterfaceId].push(tokenInfo.token)
      } else {
        // Except from NonStandard, the interface might be any string or undefined. We merge all that together.
        tokenIdsByType[e.TokenStdInterfaceId.NonStandard].push(tokenInfo.token)
      }

      return tokenIdsByType
    },
    {
      [e.TokenStdInterfaceId.Fungible]: [],
      [e.TokenStdInterfaceId.NonFungible]: [],
      [e.TokenStdInterfaceId.NonStandard]: []
    } as Record<e.TokenStdInterfaceId, TokenId[]>
  ),
  ...combineIsLoading(results)
})

export const fungibleTokenMetadataQuery = ({ id, networkId, skip }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'fungible', 'metadata', id],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    meta: { isMainnet: networkId === 0 },
    queryFn: !skip
      ? async () => {
          const tokenMetadata = await batchers.ftMetadataBatcher.fetch(id)

          return tokenMetadata ? convertTokenDecimalsToNumber(tokenMetadata) : null
        }
      : skipToken
  })

export const nftMetadataQuery = ({ id, networkId, skip }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'non-fungible', 'metadata', id],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: !skip ? async () => (await batchers.nftMetadataBatcher.fetch(id)) ?? null : skipToken
  })

export const nftDataQuery = ({ id, tokenUri, networkId, skip }: NFTQueryProps) =>
  queryOptions({
    queryKey: ['token', 'non-fungible', 'data', id],
    // We don't want to delete the NFT data when the user navigates away from NFT components.
    ...getQueryConfig({ staleTime: ONE_DAY_MS, gcTime: Infinity, networkId }),
    queryFn:
      !skip && !!tokenUri
        ? async () => {
            const res = await axios.get(tokenUri)
            const nftData = res.data as NFTTokenUriMetaData

            if (!nftData || !nftData.name) {
              return Promise.reject()
            }

            const dataTypeRes = nftData.image ? (await axios.get(nftData.image)).headers['content-type'] || '' : ''

            const dataTypeCategory = dataTypeRes.split('/')[0]

            const dataType = dataTypeCategory in NFTDataTypes ? (dataTypeCategory as NFTDataType) : 'other'

            return matchesNFTTokenUriMetaDataSchema(nftData)
              ? { id, dataType, ...nftData }
              : {
                  id,
                  dataType,
                  name: nftData.name,
                  image: nftData.image ? nftData.image.toString() : ''
                }
          }
        : skipToken
  })
