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

import { TokenInfo } from '@alephium/web3/dist/src/api/api-explorer'
import { chunk } from 'lodash'

import { baseApi } from '@/api/baseApi'
import { client } from '@/api/client'
import { TOKENS_QUERY_LIMIT } from '@/api/limits'
import { ONE_DAY_MS } from '@/constants'

export const genericAssetsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTokensGenericInfo: build.query<TokenInfo[], string[]>({
      queryFn: async (tokenIds) => {
        const tokensInfo = await Promise.all(
          chunk(tokenIds, TOKENS_QUERY_LIMIT).map((unknownTokenIdsChunk) =>
            client.explorer.tokens.postTokens(unknownTokenIdsChunk)
          )
        )

        return { data: tokensInfo.flat() }
      },
      providesTags: (result, error, tokenIds) =>
        tokenIds.map((id) => ({
          type: 'TokenInfo',
          id
        })),
      keepUnusedDataFor: ONE_DAY_MS / 1000
    })
  })
})

export const { useGetTokensGenericInfoQuery } = genericAssetsApi
