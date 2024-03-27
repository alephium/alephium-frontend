import { alephiumBaseQuery } from '@/api/alephiumBaseQuery'
import { client } from '@/api/client'
import { NFTCollectionMetaData, NFTCollectionUriMetaData } from '@alephium/web3'
import { BaseQueryFn, createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { error } from 'console'
import { result } from 'lodash'

export const nftsApi = createApi({
  baseQuery: alephiumBaseQuery,
  tagTypes: ['NFTCollectionMetaData', 'NFTCollectionUriMetaData'],
  endpoints: (build) => ({
    getNFTCollectionMetadata: build.query<NFTCollectionMetaData[], string>({
      queryFn: async (collectionId) => ({
        data: await client.explorer.tokens.postTokensNftCollectionMetadata([collectionId])
      }),
      providesTags: (result, error, collectionUri) => [{ type: 'NFTCollectionUriMetaData', collectionUri }]
    }),
    getNFTCollectionData: build.query<NFTCollectionUriMetaData, string>({
      queryFn: (collectionUri) => fetch(collectionUri).then((res) => res.json()),
      providesTags: (result, error, collectionUri) => [{ type: 'NFTCollectionUriMetaData', collectionUri }]
    })
  })
})

export const { useGetNFTCollectionMetadataQuery } = nftsApi
