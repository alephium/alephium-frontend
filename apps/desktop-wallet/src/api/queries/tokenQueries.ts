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

import { client } from '@alephium/shared'
import { explorer } from '@alephium/web3'
import { queryOptions } from '@tanstack/react-query'

import { TokenId } from '@/types/tokens'

export type TokenTypesQueryFnData = Record<explorer.TokenStdInterfaceId, TokenId[]>

const StdInterfaceIds = Object.values(explorer.TokenStdInterfaceId)

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
