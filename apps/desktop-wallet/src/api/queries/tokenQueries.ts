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

import { batchers, ONE_DAY_MS } from '@alephium/shared'
import { explorer, NFTMetaData, NFTTokenUriMetaData } from '@alephium/web3'
import { TokenInfo, TokenStdInterfaceId } from '@alephium/web3/dist/src/api/api-explorer'
import { queryOptions, skipToken, UseQueryResult } from '@tanstack/react-query'
import axios from 'axios'

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { convertTokenDecimalsToNumber, matchesNFTTokenUriMetaDataSchema } from '@/api/apiUtils'
import { TokenId } from '@/types/tokens'

export type TokenTypesQueryFnData = Record<explorer.TokenStdInterfaceId, TokenId[]>

export const StdInterfaceIds = Object.values(explorer.TokenStdInterfaceId)

interface TokenQueryProps extends SkipProp {
  id: TokenId
}

interface NFTQueryProps extends TokenQueryProps {
  tokenUri?: NFTMetaData['tokenUri']
}

export const tokenTypeQuery = ({ id, skip }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'type', id],
    staleTime: Infinity,
    // We always want to remember the type of a token, even when user navigates for too long from components that use
    // tokens.
    gcTime: Infinity,
    queryFn: !skip
      ? async () => {
          const tokenInfo = await batchers.tokenTypeBatcher.fetch(id)

          return tokenInfo?.stdInterfaceId
            ? { ...tokenInfo, stdInterfaceId: tokenInfo.stdInterfaceId as TokenStdInterfaceId }
            : null
        }
      : skipToken
  })

export const combineTokenTypeQueryResults = (results: UseQueryResult<TokenInfo | null>[]) => ({
  data: results.reduce(
    (tokenIdsByType, { data: tokenInfo }) => {
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
    } as Record<explorer.TokenStdInterfaceId, TokenId[]>
  ),
  ...combineIsLoading(results)
})

export const fungibleTokenMetadataQuery = ({ id, skip }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'fungible', 'metadata', id],
    staleTime: Infinity,
    // We don't want to delete the fungible token metadata when the user navigates away components that need them.
    gcTime: Infinity,
    queryFn: !skip
      ? async () => {
          const tokenMetadata = await batchers.ftMetadataBatcher.fetch(id)

          return tokenMetadata ? convertTokenDecimalsToNumber(tokenMetadata) : null
        }
      : skipToken
  })

export const nftMetadataQuery = ({ id, skip }: TokenQueryProps) =>
  queryOptions({
    queryKey: ['token', 'non-fungible', 'metadata', id],
    staleTime: Infinity,
    gcTime: Infinity, // We don't want to delete the NFT metadata when the user navigates away from NFT components.
    queryFn: !skip ? async () => (await batchers.nftMetadataBatcher.fetch(id)) ?? null : skipToken
  })

export const nftDataQuery = ({ id, tokenUri, skip }: NFTQueryProps) =>
  queryOptions({
    queryKey: ['token', 'non-fungible', 'data', id],
    staleTime: ONE_DAY_MS,
    gcTime: Infinity, // We don't want to delete the NFT data when the user navigates away from NFT components.
    queryFn:
      !skip && !!tokenUri
        ? async () => {
            const nftData = (await axios.get(tokenUri)).data as NFTTokenUriMetaData

            return matchesNFTTokenUriMetaDataSchema(nftData)
              ? { id, ...nftData }
              : {
                  id,
                  name: nftData?.name.toString() || 'Unsupported NFT',
                  image: nftData?.image.toString() || ''
                }
          }
        : skipToken
  })
