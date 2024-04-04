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
import { createApi } from '@reduxjs/toolkit/query/react'

import { baseQuery } from '@/api/baseQuery'
import { client } from '@/api/client'
import { ONE_DAY_MS } from '@/constants'

export const nftsApi = createApi({
  baseQuery,
  tagTypes: ['NFTCollectionMetadata', 'NFTCollectionUriMetaData'],
  endpoints: (build) => ({
    getNFTCollectionMetadata: build.query<NFTCollectionMetadata, string>({
      queryFn: async (collectionId) => ({
        data: (await client.explorer.tokens.postTokensNftCollectionMetadata([addressFromContractId(collectionId)]))[0]
      }),
      providesTags: (result, error, collectionId) => [{ type: 'NFTCollectionMetadata', collectionId }],
      keepUnusedDataFor: ONE_DAY_MS * 1000
    }),
    getNFTCollectionData: build.query<NFTCollectionUriMetaData, string>({
      queryFn: (collectionUri) =>
        fetch(collectionUri).then((res) => ({ data: res.json() as unknown as NFTCollectionUriMetaData })),
      providesTags: (result, error, collectionUri) => [{ type: 'NFTCollectionUriMetaData', collectionUri }],
      keepUnusedDataFor: ONE_DAY_MS * 1000
    })
  })
})

export const { useGetNFTCollectionMetadataQuery, useGetNFTCollectionDataQuery } = nftsApi
