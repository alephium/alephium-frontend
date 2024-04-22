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

import { queryOptions } from '@tanstack/react-query'
import { create, keyResolver, windowedFiniteBatchScheduler } from '@yornaath/batshit'

import { client } from '@/api/alephiumClient'
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

export const getTokenGenericInfo = (tokenId: string) =>
  queryOptions({
    queryFn: async () => await batchedTokenGenericInfo.fetch(tokenId),
    queryKey: ['tokenInfo', tokenId],
    staleTime: ONE_DAY_MS
  })
