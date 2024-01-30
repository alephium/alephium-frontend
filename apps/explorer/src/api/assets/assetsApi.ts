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

import { NFTCollectionUriMetaData, NFTTokenUriMetaData, TOKENS_QUERY_LIMIT } from '@alephium/shared'
import { TokenList } from '@alephium/token-list'
import { addressFromContractId } from '@alephium/web3'
import { NFTCollectionMetadata } from '@alephium/web3/dist/src/api/api-explorer'
import { create, keyResolver, windowedFiniteBatchScheduler } from '@yornaath/batshit'

import client from '@/api/client'
import {
  AssetBase,
  AssetType,
  UnverifiedFungibleTokenMetadata,
  UnverifiedNFTMetadata,
  VerifiedFungibleTokenMetadata
} from '@/types/assets'
import { NetworkType } from '@/types/network'
import { createQueriesCollection } from '@/utils/api'
import { ONE_DAY_MS, ONE_HOUR_MS, ONE_MINUTE_MS } from '@/utils/time'

// Batched calls
const tokensInfo = create({
  fetcher: async (ids: string[]) => client.explorer.tokens.postTokens(ids.filter((id) => id !== '')),
  resolver: keyResolver('token'),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 10,
    maxBatchSize: TOKENS_QUERY_LIMIT
  })
})

const fungibleTokensMetadata = create({
  fetcher: async (ids: string[]) => client.explorer.tokens.postTokensFungibleMetadata(ids.filter((id) => id !== '')),
  resolver: keyResolver('id'),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 10,
    maxBatchSize: TOKENS_QUERY_LIMIT
  })
})

const unverifiedNFTsMetadata = create({
  fetcher: async (ids: string[]) => client.explorer.tokens.postTokensNftMetadata(ids.filter((id) => id !== '')),
  resolver: keyResolver('id'),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 10,
    maxBatchSize: TOKENS_QUERY_LIMIT
  })
})

const NFTCollectionsMetadata = create({
  fetcher: async (ids: string[]) =>
    client.explorer.tokens.postTokensNftCollectionMetadata(ids.filter((id) => id !== '')),
  resolver: keyResolver('address'),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 10,
    maxBatchSize: TOKENS_QUERY_LIMIT
  })
})

// Queries
export const assetsQueries = createQueriesCollection({
  type: {
    one: (assetId: string) => ({
      queryKey: ['assetType', assetId],
      queryFn: (): Promise<AssetBase> =>
        tokensInfo.fetch(assetId).then((r) => ({ id: assetId, type: r.stdInterfaceId as AssetType })),
      staleTime: ONE_DAY_MS
    })
  },
  metadata: {
    allVerifiedTokens: (network: NetworkType) => ({
      queryKey: ['verifiedTokens', network],
      queryFn: (): Promise<VerifiedFungibleTokenMetadata[]> => {
        try {
          return fetch(`https://raw.githubusercontent.com/alephium/token-list/master/tokens/${network}.json`).then(
            (r) => r.json().then((j: TokenList) => j.tokens.map((v) => ({ ...v, type: 'fungible', verified: true })))
          )
        } catch (e) {
          console.error(e)
          return Promise.reject(new Error('Verified token fetch failed'))
        }
      },
      staleTime: ONE_DAY_MS
    }),
    unverifiedFungibleToken: (assetId: string) => ({
      queryKey: ['unverifiedFungibleToken', assetId],
      queryFn: (): Promise<UnverifiedFungibleTokenMetadata> =>
        fungibleTokensMetadata.fetch(assetId).then((r) => {
          const parsedDecimals = parseInt(r.decimals)

          return {
            ...r,
            type: 'fungible',
            decimals: Number.isInteger(parsedDecimals) ? parsedDecimals : 0,
            verified: false
          }
        }),
      staleTime: ONE_HOUR_MS
    }),
    unverifiedNFT: (assetId: string) => ({
      queryKey: ['unverifiedNFT', assetId],
      queryFn: (): Promise<UnverifiedNFTMetadata> =>
        unverifiedNFTsMetadata
          .fetch(assetId)
          .then((r) => ({ ...r, id: assetId, type: 'non-fungible', verified: false })),
      staleTime: ONE_HOUR_MS
    }),
    NFTCollection: (collectionId: string) => ({
      queryKey: ['NFTCollection', collectionId],
      queryFn: (): Promise<NFTCollectionMetadata & { id: string }> =>
        NFTCollectionsMetadata.fetch(addressFromContractId(collectionId)).then((r) => ({ ...r, id: collectionId })),
      staleTime: ONE_HOUR_MS
    })
  },
  NFTsData: {
    item: (dataUri: string, assetId: string) => ({
      queryKey: ['nftData', dataUri],
      queryFn: (): Promise<NFTTokenUriMetaData & { assetId: string }> | undefined =>
        fetch(dataUri).then((res) => res.json().then((f) => ({ ...f, assetId }))),
      staleTime: ONE_DAY_MS
    }),
    collection: (collectionUri: string, collectionId: string, collectionAddress: string) => ({
      queryKey: ['nftCollectionData', collectionUri],
      queryFn: ():
        | Promise<NFTCollectionUriMetaData & { collectionId: string; collectionAddress: string }>
        | undefined =>
        fetch(collectionUri).then((res) => res.json().then((f) => ({ ...f, collectionId, collectionAddress }))),
      staleTime: ONE_DAY_MS
    })
  },
  prices: {
    assetPrice: (tokenSymbol: string, currency = 'usd') => ({
      queryKey: ['tokenPrice', tokenSymbol, currency],
      queryFn: async (): Promise<number> =>
        (await client.explorer.market.postMarketPrices({ currency: 'usd' }, [tokenSymbol]))[0],
      staleTime: ONE_MINUTE_MS
    })
  }
})
