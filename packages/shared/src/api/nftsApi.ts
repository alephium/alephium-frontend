import { alephiumBaseQuery } from '@/api/alephiumBaseQuery'
import { client } from '@/api/client'
import { ONE_DAY_MS } from '@/constants'
import { NFTCollectionUriMetaData, addressFromContractId } from '@alephium/web3'
import { NFTCollectionMetadata } from '@alephium/web3/dist/src/api/api-explorer'
import { createApi } from '@reduxjs/toolkit/query/react'

export const nftsApi = createApi({
  baseQuery: alephiumBaseQuery,
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
