/*
Copyright 2018 - 2023 The Alephium Authors
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

import { NFTCollectionUriMetaData, NFTTokenUriMetaData } from '@alephium/shared'
import { addressFromContractId } from '@alephium/web3'
import { NFTCollectionMetadata } from '@alephium/web3/dist/src/api/api-explorer'
import { create, keyResolver, windowedFiniteBatchScheduler } from '@yornaath/batshit'

import client from '@/api/client'
import {
  AssetBase,
  AssetPriceResponse,
  AssetType,
  TokenList,
  UnverifiedFungibleTokenMetadata,
  UnverifiedNFTMetadata,
  VerifiedFungibleTokenMetadata
} from '@/types/assets'
import { NetworkType } from '@/types/network'
import { createQueriesCollection, POST_QUERY_LIMIT } from '@/utils/api'
import { ONE_DAY_MS, ONE_HOUR_MS, ONE_MINUTE_MS } from '@/utils/time'

// Batched calls

const tokensInfo = create({
  fetcher: async (ids: string[]) => client.explorer.tokens.postTokens(ids),
  resolver: keyResolver('token'),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 10,
    maxBatchSize: POST_QUERY_LIMIT
  })
})

const fungibleTokensMetadata = create({
  fetcher: async (ids: string[]) => client.explorer.tokens.postTokensFungibleMetadata(ids),
  resolver: keyResolver('id'),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 10,
    maxBatchSize: POST_QUERY_LIMIT
  })
})

const unverifiedNFTsMetadata = create({
  fetcher: async (ids: string[]) => client.explorer.tokens.postTokensNftMetadata(ids),
  resolver: keyResolver('id'),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 10,
    maxBatchSize: POST_QUERY_LIMIT
  })
})

const NFTCollectionsMetadata = create({
  fetcher: async (ids: string[]) => client.explorer.tokens.postTokensNftCollectionMetadata(ids),
  resolver: keyResolver('address'),
  scheduler: windowedFiniteBatchScheduler({
    windowMs: 10,
    maxBatchSize: POST_QUERY_LIMIT
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
    assetPrice: (coinGeckoTokenId: string, currency = 'usd') => ({
      queryKey: ['assetPrice', coinGeckoTokenId, currency],
      queryFn: async (): Promise<number> => {
        const res = (await (
          await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoTokenId}&vs_currencies=${currency}`)
        ).json()) as AssetPriceResponse

        return res[coinGeckoTokenId][currency]
      },
      staleTime: ONE_MINUTE_MS
    })
  }
})
