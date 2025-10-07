import {
  batchers,
  FtListMap,
  getNetworkNameFromNetworkId,
  is5XXError,
  NFT,
  NFTDataType,
  NFTDataTypes,
  NonStandardToken,
  ONE_DAY_MS,
  Token,
  TokenId
} from '@alephium/shared'
import { ALPH, getTokensURL, mainnet, testnet, TokenList } from '@alephium/token-list'
import { explorer as e, NFTMetaData, NFTTokenUriMetaData } from '@alephium/web3'
import { queryOptions, skipToken, UseQueryResult } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { convertTokenDecimalsToNumber, getQueryConfig, matchesNFTTokenUriMetaDataSchema } from '@/api/apiUtils'
import { queryClient } from '@/api/queryClient'

export type TokenTypesQueryFnData = Record<e.TokenStdInterfaceId, TokenId[]>

export const StdInterfaceIds = Object.values(e.TokenStdInterfaceId)

interface TokenQueryProps extends SkipProp {
  id: TokenId
  networkId?: number
  skipCaching?: boolean
}

interface NFTQueryProps extends TokenQueryProps {
  tokenUri?: NFTMetaData['tokenUri']
}

const convertTokenListToRecord = (tokenList: TokenList['tokens']): FtListMap => {
  const result: FtListMap = {}

  for (const token of tokenList) {
    result[token.id] = token
  }

  return result
}

const mainnetTokens = convertTokenListToRecord(mainnet.tokens)
const testnetTokens = convertTokenListToRecord(testnet.tokens)

export const ftListQuery = ({ networkId, skip }: Omit<TokenQueryProps, 'id'>) => {
  const network = getNetworkNameFromNetworkId(networkId) ?? 'mainnet'

  return queryOptions({
    queryKey: ['tokenList', { networkId }],
    // The token list is essential for the whole app so we don't want to ever delete it. Even if we set a lower gcTime,
    // it will never become inactive (since it's always used by a mount component).
    ...getQueryConfig({ staleTime: ONE_DAY_MS, gcTime: Infinity, networkId }),
    queryFn:
      networkId === undefined || skip
        ? skipToken
        : ({ queryKey }) =>
            network === 'devnet'
              ? { [ALPH.id]: ALPH }
              : axios
                  .get(getTokensURL(network))
                  .then(({ data }) => convertTokenListToRecord((data as TokenList)?.tokens || []))
                  .catch((error) => {
                    if (error instanceof AxiosError && error.response?.status === 429) {
                      throw error
                    }
                    const cachedTokenList = queryClient.getQueryData(queryKey)

                    if (cachedTokenList) {
                      return cachedTokenList as FtListMap
                    } else if (network === 'mainnet') {
                      return mainnetTokens
                    } else {
                      return testnetTokens
                    }
                  }),
    placeholderData: network === 'mainnet' ? mainnetTokens : network === 'testnet' ? testnetTokens : undefined
  })
}

export const tokenTypeQuery = ({ id, networkId, skip, skipCaching }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'type', getId(id, skipCaching)],
    // We always want to remember the type of a token, even when user navigates for too long from components that use
    // tokens.
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId, skipCaching }),
    queryFn:
      !skip && networkId !== undefined
        ? async () => {
            const tokenInfo = await batchers.tokenTypeBatcher.fetch(id)

            return { token: id, stdInterfaceId: tokenInfo?.stdInterfaceId } as e.TokenInfo
          }
        : skipToken
  })

export const combineTokenTypeQueryResults = (results: UseQueryResult<e.TokenInfo | null>[]) => ({
  data: combineTokenTypes(results),
  ...combineIsLoading(results)
})

export const combineTokenTypes = (tokenTypes: (e.TokenInfo | { data: e.TokenInfo | null | undefined })[]) =>
  tokenTypes.reduce(
    (tokenIdsByType, tokenType) => {
      const tokenInfo = 'data' in tokenType ? tokenType.data : tokenType

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
  )

export const fungibleTokenMetadataQuery = ({ id, networkId, skip, skipCaching }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'fungible', 'metadata', getId(id, skipCaching)],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId, skipCaching }),
    queryFn: !skip
      ? async () => {
          const tokenMetadata = await batchers.ftMetadataBatcher.fetch(id)

          return tokenMetadata ? convertTokenDecimalsToNumber(tokenMetadata) : null
        }
      : skipToken
  })

export const nftMetadataQuery = ({ id, networkId, skip, skipCaching }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'non-fungible', 'metadata', getId(id, skipCaching)],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId, skipCaching }),
    queryFn: !skip ? async () => (await batchers.nftMetadataBatcher.fetch(id)) ?? null : skipToken
  })

export const nftDataQuery = ({ id, tokenUri, networkId, skip, skipCaching }: NFTQueryProps) =>
  queryOptions({
    queryKey: ['token', 'non-fungible', 'data', getId(id, skipCaching)],
    // We don't want to delete the NFT data when the user navigates away from NFT components.
    ...getQueryConfig({ staleTime: ONE_DAY_MS, gcTime: Infinity, networkId, skipCaching }),
    queryFn:
      !skip && !!tokenUri
        ? async () => {
            const errorNftMetadata: NFTTokenUriMetaData = { name: 'Unknown NFT', image: '' }
            const errorResponse = {
              id,
              dataType: 'other' as NFTDataType,
              description: 'Could not fetch NFT data',
              ...errorNftMetadata
            }

            try {
              let nftData: NFTTokenUriMetaData

              if (tokenUri.startsWith('data:application/json,')) {
                nftData = JSON.parse(tokenUri.split('data:application/json,')[1])
              } else {
                const res = await axios.get(tokenUri)
                nftData = res.data
              }

              if (!nftData || !nftData.name) {
                return errorResponse
              }

              const dataTypeRes = nftData.image ? (await axios.head(nftData.image)).headers['content-type'] || '' : ''

              const dataTypeCategory = dataTypeRes.split('/')[0]

              const dataType: NFTDataType = dataTypeCategory in NFTDataTypes ? dataTypeCategory : 'other'

              return matchesNFTTokenUriMetaDataSchema(nftData)
                ? { id, dataType, ...nftData }
                : {
                    id,
                    dataType,
                    ...nftData,
                    name: nftData.name,
                    image: nftData.image
                      ? nftData.image.toString()
                      : `https://placehold.co/400x400/000000/FFFFFF/jpeg?text=${encodeURIComponent(nftData.name)}`
                  }
            } catch (error) {
              errorResponse.description =
                error instanceof AxiosError ? `${error.message} - ${tokenUri}` : errorResponse.description
              return errorResponse
            }
          }
        : skipToken
  })

export const NOCACHE_PREFIX = 'nocache-'

export const tokenQuery = ({ id: dirtyId, networkId, skip, skipCaching: skipCachingProp }: TokenQueryProps) => {
  const isDirtyId = dirtyId.startsWith(NOCACHE_PREFIX)
  const id = isDirtyId ? dirtyId.split(NOCACHE_PREFIX)[1] : dirtyId
  const skipCaching = isDirtyId || skipCachingProp

  return queryOptions({
    queryKey: ['token', getId(id, skipCaching), { networkId }],
    ...getQueryConfig({
      staleTime: Infinity,
      gcTime: Infinity,
      networkId,
      skipCaching
    }),
    queryFn: async (): Promise<Token> => {
      const nst = { id } as NonStandardToken

      try {
        // 1. First check if the token is in the token list
        const fTList = await queryClient.fetchQuery(ftListQuery({ networkId }))
        const listedFT = fTList[id]

        if (listedFT) return listedFT

        // 2. If not, find the type of the token
        const tokenInfo = await queryClient.fetchQuery(tokenTypeQuery({ id, networkId, skipCaching }))

        // 3. If it is a fungible token, fetch the fungible token metadata
        if (tokenInfo?.stdInterfaceId === e.TokenStdInterfaceId.Fungible) {
          const ftMetadata = await queryClient.fetchQuery(fungibleTokenMetadataQuery({ id, networkId, skipCaching }))

          return ftMetadata ?? nst
        }

        // 4. If it is an NFT, fetch the NFT metadata and data
        if (tokenInfo?.stdInterfaceId === e.TokenStdInterfaceId.NonFungible) {
          const nft = await queryClient.fetchQuery(nftQuery({ id, networkId, skipCaching }))

          return nft ?? nst
        }
      } catch (e) {
        if (is5XXError(e)) {
          return nst
        } else {
          throw e
        }
      }

      // 5. If the type of the token cannot be determined, return the non-standard token
      return nst
    },
    enabled: !skip
  })
}

export const nftQuery = ({ id, networkId, skip, skipCaching }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'non-fungible', getId(id, skipCaching), { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId, skipCaching }),
    queryFn: async (): Promise<NFT | null> => {
      const nftMetadata = await queryClient.fetchQuery(nftMetadataQuery({ id, networkId, skipCaching }))

      if (!nftMetadata) return null

      const nftData = await queryClient.fetchQuery(
        nftDataQuery({ id, tokenUri: nftMetadata.tokenUri, networkId, skipCaching })
      )

      if (!nftData) return null

      return { ...nftData, ...nftMetadata }
    },
    enabled: !skip
  })

const getId = (id: string, skipCaching?: boolean) => `${skipCaching ? NOCACHE_PREFIX : ''}${id}`
