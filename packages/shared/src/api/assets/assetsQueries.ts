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

import { TokenList } from '@alephium/token-list'
import { queryOptions } from '@tanstack/react-query'
import { create, keyResolver, windowedFiniteBatchScheduler } from '@yornaath/batshit'

import { exponentialBackoffFetchRetry } from '@/api'
import { client } from '@/api/alephiumClient'
import { TOKENS_QUERY_LIMIT } from '@/api/limits'
import { ONE_DAY_MS, ONE_HOUR_MS } from '@/constants'
import { NetworkName, NFTTokenUriMetaData } from '@/types'

const tokenGenericInfoBatcher = create({
  fetcher: async (ids: string[]) => client.explorer.tokens.postTokens(ids),
  resolver: keyResolver('token'),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 10,
    maxBatchSize: TOKENS_QUERY_LIMIT
  })
})

const fungibleTokensMetadataBatcher = create({
  fetcher: async (ids: string[]) =>
    await client.explorer.tokens.postTokensFungibleMetadata(ids.filter((id) => id !== '')),
  resolver: keyResolver('id'),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 10,
    maxBatchSize: TOKENS_QUERY_LIMIT
  })
})

const nftsMetadataBatcher = create({
  fetcher: async (ids: string[]) => client.explorer.tokens.postTokensNftMetadata(ids.filter((id) => id !== '')),
  resolver: keyResolver('id'),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 10,
    maxBatchSize: TOKENS_QUERY_LIMIT
  })
})

export const assetsQueries = {
  generic: {
    getTokenGenericInfo: (tokenId: string) =>
      queryOptions({
        queryKey: ['tokenInfo', tokenId],
        queryFn: async () => await tokenGenericInfoBatcher.fetch(tokenId),
        staleTime: ONE_DAY_MS
      })
  },
  tokenList: {
    getTokenListQuery: (networkName: NetworkName) =>
      queryOptions({
        queryKey: ['tokenList'],
        queryFn: async () => {
          if (!(['mainnet', 'testnet', 'devnet'] as NetworkName[]).includes(networkName)) {
            console.error('Invalid network name')
            return
          }

          const res = await exponentialBackoffFetchRetry(
            `https://raw.githubusercontent.com/alephium/token-list/master/tokens/${networkName}.json`
          )

          return (await res.json()) as unknown as TokenList
        },
        staleTime: ONE_DAY_MS
      })
  },
  fungibleTokens: {
    getFungibleTokenMetadata: (tokenId: string) =>
      queryOptions({
        queryKey: ['fungibleTokenMetadata', tokenId],
        queryFn: () =>
          fungibleTokensMetadataBatcher.fetch(tokenId).then((r) => {
            const parsedDecimals = parseInt(r.decimals)

            return {
              ...r,
              decimals: Number.isInteger(parsedDecimals) ? parsedDecimals : 0
            }
          }),
        staleTime: ONE_HOUR_MS
      })
  },
  nfts: {
    getNftMetadataQuery: (tokenId: string) =>
      queryOptions({
        queryKey: ['nftMetadata', tokenId],
        queryFn: async () => {
          const nftsMetadata = await nftsMetadataBatcher.fetch(tokenId)

          const nftsData = await exponentialBackoffFetchRetry(nftsMetadata.tokenUri).then(
            (res) => res.json() as unknown as NFTTokenUriMetaData
          )

          return { ...nftsMetadata, ...nftsData }
        },
        staleTime: ONE_HOUR_MS
      })
  }
}
