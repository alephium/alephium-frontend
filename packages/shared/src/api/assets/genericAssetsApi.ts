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

import { useLoopedQueries } from '@alephium/shared-react'
import { TokenInfo } from '@alephium/web3/dist/src/api/api-explorer'
import { create, keyResolver, windowedFiniteBatchScheduler } from '@yornaath/batshit'

import { baseApi } from '@/api/baseApi'
import { client } from '@/api/client'
import { TOKENS_QUERY_LIMIT } from '@/api/limits'
import { ONE_DAY_MS } from '@/constants'

const batchedTokenGenericInfo = create({
  fetcher: async (ids: string[]) => client.explorer.tokens.postTokens(ids),
  resolver: keyResolver('token'),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 10,
    maxBatchSize: TOKENS_QUERY_LIMIT
  })
})

export const genericAssetsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTokenGenericInfo: build.query<TokenInfo, string>({
      queryFn: async (tokenId) => ({ data: await batchedTokenGenericInfo.fetch(tokenId) }),
      providesTags: (result, error, tokenId) => [
        {
          type: 'TokenInfo',
          id: tokenId
        }
      ],
      keepUnusedDataFor: ONE_DAY_MS / 1000
    })
  })
})

const { useLazyGetTokenGenericInfoQuery } = genericAssetsApi

export const useGetTokensGenericInfoQuery = (tokenIds: string[]) =>
  useLoopedQueries(tokenIds, useLazyGetTokenGenericInfoQuery)
