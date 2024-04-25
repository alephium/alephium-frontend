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

import { addressFromContractId, NFTCollectionUriMetaData } from '@alephium/web3'
import { NFTCollectionMetadata } from '@alephium/web3/dist/src/api/api-explorer'
import { queryOptions } from '@tanstack/react-query'
import { create, keyResolver, windowedFiniteBatchScheduler } from '@yornaath/batshit'

import { client } from '@/api/alephiumClient'
import { baseApi } from '@/api/baseApi'
import { exponentialBackoffFetchRetry } from '@/api/fetchRetry'
import { TOKENS_QUERY_LIMIT } from '@/api/limits'
import { ONE_DAY_MS, ONE_HOUR_MS } from '@/constants'
import { NFTTokenUriMetaData } from '@/types'

export const nftsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNftCollectionMetadata: build.query<NFTCollectionMetadata, string>({
      queryFn: async (collectionId) => ({
        data: (await client.explorer.tokens.postTokensNftCollectionMetadata([addressFromContractId(collectionId)]))[0]
      }),
      providesTags: (result, error, collectionId) => [{ type: 'NFTCollectionMetadata', collectionId }],
      keepUnusedDataFor: ONE_DAY_MS / 1000
    }),
    getNftCollectionData: build.query<NFTCollectionUriMetaData, string>({
      queryFn: (collectionUri) =>
        exponentialBackoffFetchRetry(collectionUri).then((res) => ({
          data: res.json() as unknown as NFTCollectionUriMetaData
        })),
      providesTags: (result, error, collectionUri) => [{ type: 'NFTCollectionUriMetaData', collectionUri }],
      keepUnusedDataFor: ONE_DAY_MS / 1000
    })
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

export const getNftMetadataQuery = (tokenId: string) =>
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

export const { useGetNftCollectionMetadataQuery, useGetNftCollectionDataQuery } = nftsApi
