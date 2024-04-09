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
import { NFTCollectionMetadata, NFTMetadata } from '@alephium/web3/dist/src/api/api-explorer'

import { baseApi } from '@/api/baseApi'
import { client } from '@/api/client'
import { exponentialBackoffFetchRetry } from '@/api/fetchRetry'
import { ONE_DAY_MS } from '@/constants'
import { NFT } from '@/types'
import { TOKENS_QUERY_LIMIT } from '@/api/limits'
import { isPromiseFulfilled } from '@/utils'
import { chunk } from 'lodash'
import posthog from 'posthog-js'

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
    }),
    getNftsMetadata: build.query<NFT[], string[]>({
      queryFn: async (nftIds) => {
        let nfts: NFT[] = []
        let nftsMetadata: NFTMetadata[] = []

        try {
          nftsMetadata = (
            await Promise.all(
              chunk(nftIds, TOKENS_QUERY_LIMIT).map((unknownTokenIdsChunk) =>
                client.explorer.tokens.postTokensNftMetadata(unknownTokenIdsChunk)
              )
            )
          ).flat()
        } catch (e) {
          console.error(e)
          posthog.capture('Error', { message: 'Syncing unknown NFT info' })
        }

        const promiseResults = await Promise.allSettled(
          nftsMetadata.map(({ tokenUri, id }) =>
            exponentialBackoffFetchRetry(tokenUri)
              .then((res) => res.json())
              .then((data) => ({ ...data, id }))
          )
        )
        const nftsData = promiseResults.filter(isPromiseFulfilled).flatMap((r) => r.value)

        nfts = nftsMetadata.map(({ id, collectionId }) => ({
          id,
          collectionId,
          ...(nftsData.find((nftData) => nftData.id === id) || {})
        }))

        return { data: nfts }
      }
    })
  })
})

export const { useGetNftCollectionMetadataQuery, useGetNftCollectionDataQuery, useGetNftsMetadataQuery } = nftsApi
