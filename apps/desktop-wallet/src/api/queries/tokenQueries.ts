/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { client, ONE_DAY_MS } from '@alephium/shared'
import { explorer, NFTMetaData, NFTTokenUriMetaData } from '@alephium/web3'
import { TokenStdInterfaceId } from '@alephium/web3/dist/src/api/api-explorer'
import { queryOptions, skipToken } from '@tanstack/react-query'
import axios from 'axios'

import { convertDecimalsToNumber, matchesNFTTokenUriMetaDataSchema } from '@/api/utils'
import { TokenId } from '@/types/tokens'

export type TokenTypesQueryFnData = Record<explorer.TokenStdInterfaceId, TokenId[]>

const StdInterfaceIds = Object.values(explorer.TokenStdInterfaceId)

interface TokenQueryProps {
  id: TokenId
  skip?: boolean
}

interface NFTQueryProps {
  id: TokenId
  tokenUri?: NFTMetaData['tokenUri']
  skip?: boolean
}

export const tokenTypeQuery = ({ id, skip }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'type', id],
    queryFn: !skip
      ? async () => {
          const tokenInfo = (await client.explorer.tokens.postTokens([id]))[0]

          return tokenInfo
            ? { ...tokenInfo, stdInterfaceId: tokenInfo.stdInterfaceId as TokenStdInterfaceId | undefined }
            : undefined
        }
      : skipToken,
    staleTime: Infinity
  })

export const fungibleTokenMetadataQuery = ({ id, skip }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'fungible', 'metadata', id],
    queryFn: !skip
      ? async () => {
          const tokenMetadata = (await client.explorer.tokens.postTokensFungibleMetadata([id]))[0]

          return tokenMetadata ? convertDecimalsToNumber(tokenMetadata) : undefined
        }
      : skipToken,
    staleTime: Infinity
  })

export const nftMetadataQuery = ({ id, skip }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'non-fungible', 'metadata', id],
    queryFn: !skip ? async () => (await client.explorer.tokens.postTokensNftMetadata([id]))[0] : skipToken,
    staleTime: Infinity
  })

export const nftDataQuery = ({ id, tokenUri, skip }: NFTQueryProps) =>
  queryOptions({
    queryKey: ['token', 'non-fungible', 'data', id],
    queryFn:
      !skip && !!tokenUri
        ? async () => {
            const nftData = (await axios.get(tokenUri)).data as NFTTokenUriMetaData

            return matchesNFTTokenUriMetaDataSchema(nftData)
              ? nftData
              : {
                  name: nftData?.name.toString() || 'Unsupported NFT',
                  image: nftData?.image.toString() || ''
                }
          }
        : skipToken,
    staleTime: ONE_DAY_MS
  })

export const tokenTypesQuery = (ids: TokenId[]) =>
  queryOptions({
    queryKey: ['tokens', 'type', ids],
    queryFn: async (): Promise<TokenTypesQueryFnData> => {
      const tokensInfo = await client.explorer.tokens.postTokens(ids)

      return tokensInfo.reduce(
        (tokenIdsByType, tokenInfo) => {
          if (!tokenInfo) return tokenIdsByType
          const stdInterfaceId = tokenInfo.stdInterfaceId as explorer.TokenStdInterfaceId

          if (StdInterfaceIds.includes(stdInterfaceId)) {
            tokenIdsByType[stdInterfaceId].push(tokenInfo.token)
          } else {
            // Except from NonStandard, the interface might be any string or undefined. We merge all that together.
            tokenIdsByType[explorer.TokenStdInterfaceId.NonStandard].push(tokenInfo.token)
          }

          return tokenIdsByType
        },
        {
          [explorer.TokenStdInterfaceId.Fungible]: [],
          [explorer.TokenStdInterfaceId.NonFungible]: [],
          [explorer.TokenStdInterfaceId.NonStandard]: []
        } as TokenTypesQueryFnData
      )
    },
    staleTime: Infinity
  })
