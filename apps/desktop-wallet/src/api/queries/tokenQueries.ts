import { batchers, NFT, NFTDataType, NFTDataTypes, ONE_DAY_MS } from '@alephium/shared'
import { getQueryConfig, queryClient } from '@alephium/shared-react'
import { ALPH, getTokensURL, mainnet, testnet, TokenList } from '@alephium/token-list'
import { explorer as e, NFTMetaData, NFTTokenUriMetaData } from '@alephium/web3'
import { queryOptions, skipToken, UseQueryResult } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { convertTokenDecimalsToNumber, matchesNFTTokenUriMetaDataSchema } from '@/api/apiUtils'
import { FtListMap, NonStandardToken, Token, TokenId } from '@/types/tokens'

export type TokenTypesQueryFnData = Record<e.TokenStdInterfaceId, TokenId[]>

export const StdInterfaceIds = Object.values(e.TokenStdInterfaceId)

interface TokenQueryProps extends SkipProp {
  id: TokenId
  networkId?: number
}

interface NFTQueryProps extends TokenQueryProps {
  tokenUri?: NFTMetaData['tokenUri']
}

export const ftListQuery = ({ networkId, skip }: Omit<TokenQueryProps, 'id'>) => {
  const network = networkId === 0 ? 'mainnet' : networkId === 1 ? 'testnet' : networkId === 4 ? 'devnet' : undefined

  return queryOptions({
    queryKey: ['tokenList', { networkId }],
    // The token list is essential for the whole app so we don't want to ever delete it. Even if we set a lower gcTime,
    // it will never become inactive (since it's always used by a mount component).
    ...getQueryConfig({ staleTime: ONE_DAY_MS, gcTime: Infinity, networkId }),
    queryFn:
      !network || skip
        ? skipToken
        : () =>
            network === 'devnet'
              ? { [ALPH.id]: ALPH }
              : axios
                  .get(getTokensURL(network))
                  .then(({ data }) => convertTokenListToRecord((data as TokenList)?.tokens || [])),
    placeholderData: convertTokenListToRecord(
      network === 'mainnet' ? mainnet.tokens : network === 'testnet' ? testnet.tokens : []
    )
  })
}

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

export const fungibleTokenMetadataQuery = ({ id, networkId, skip }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'fungible', 'metadata', id],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
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
            const errorNftMetadata: NFTTokenUriMetaData = { name: 'Unknown NFT', image: '' }
            const errorResponse = {
              id,
              dataType: 'other' as NFTDataType,
              description: 'Could not fetch NFT data',
              ...errorNftMetadata
            }

            try {
              const res = await axios.get(tokenUri)
              const nftData = res.data as NFTTokenUriMetaData

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
                    name: nftData.name,
                    image: nftData.image ? nftData.image.toString() : ''
                  }
            } catch (error) {
              errorResponse.description =
                error instanceof AxiosError ? `${error.message} - ${tokenUri}` : errorResponse.description
              return errorResponse
            }
          }
        : skipToken
  })

export const tokenQuery = ({ id, networkId, skip }: TokenQueryProps) =>
  queryOptions({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: ['token', id, { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: async (): Promise<Token> => {
      const nst = { id } as NonStandardToken

      // 1. First check if the token is in the token list
      const fTList = await queryClient.fetchQuery(ftListQuery({ networkId }))
      const listedFT = fTList[id]

      if (listedFT) return listedFT

      // 2. If not, find the type of the token
      const tokenInfo = await queryClient.fetchQuery(tokenTypeQuery({ id, networkId }))

      // 3. If it is a fungible token, fetch the fungible token metadata
      if (tokenInfo?.stdInterfaceId === e.TokenStdInterfaceId.Fungible) {
        const ftMetadata = await queryClient.fetchQuery(fungibleTokenMetadataQuery({ id, networkId }))

        return ftMetadata ?? nst
      }

      // 4. If it is an NFT, fetch the NFT metadata and data
      if (tokenInfo?.stdInterfaceId === e.TokenStdInterfaceId.NonFungible) {
        const nft = await queryClient.fetchQuery(nftQuery({ id, networkId }))

        return nft ?? nst
      }

      // 5. If the type of the token cannot be determined, return the non-standard token
      return nst
    },
    enabled: !skip
  })

export const nftQuery = ({ id, networkId, skip }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'non-fungible', id, { networkId }],
    ...getQueryConfig({ staleTime: Infinity, gcTime: Infinity, networkId }),
    queryFn: async (): Promise<NFT | null> => {
      const nftMetadata = await queryClient.fetchQuery(nftMetadataQuery({ id, networkId }))

      if (!nftMetadata) return null

      const nftData = await queryClient.fetchQuery(nftDataQuery({ id, tokenUri: nftMetadata.tokenUri, networkId }))

      if (!nftData) return null

      return { ...nftData, ...nftMetadata }
    },
    enabled: !skip
  })

const convertTokenListToRecord = (tokenList: TokenList['tokens']): FtListMap =>
  tokenList.reduce((acc, token) => ({ ...acc, [token.id]: token }), {} as FtListMap)
