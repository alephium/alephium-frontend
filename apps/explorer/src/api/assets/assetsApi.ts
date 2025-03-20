import {
  matchesNFTTokenUriMetaDataSchema,
  NetworkPreset,
  NFTDataType,
  NFTDataTypes,
  ONE_DAY_MS,
  ONE_HOUR_MS,
  ONE_MINUTE_MS,
  TOKENS_QUERY_LIMIT
} from '@alephium/shared'
import { TokenList } from '@alephium/token-list'
import { addressFromContractId, NFTCollectionUriMetaData, NFTTokenUriMetaData } from '@alephium/web3'
import { NFTCollectionMetadata } from '@alephium/web3/dist/src/api/api-explorer'
import { queryOptions } from '@tanstack/react-query'
import { create, keyResolver, windowedFiniteBatchScheduler } from '@yornaath/batshit'
import axios from 'axios'

import client from '@/api/client'
import i18n from '@/features/localization/i18n'
import {
  AssetBase,
  AssetType,
  UnverifiedFungibleTokenMetadata,
  UnverifiedNFTMetadata,
  VerifiedFungibleTokenMetadata
} from '@/types/assets'

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
export const assetsQueries = {
  type: {
    one: (assetId: string) =>
      queryOptions({
        queryKey: ['assetType', assetId],
        queryFn: (): Promise<AssetBase> =>
          tokensInfo.fetch(assetId).then((r) => ({ id: assetId, type: r.stdInterfaceId as AssetType })),
        staleTime: ONE_DAY_MS
      })
  },
  metadata: {
    allVerifiedTokens: (network: NetworkPreset) =>
      queryOptions({
        queryKey: ['verifiedTokens', network],
        queryFn: (): Promise<VerifiedFungibleTokenMetadata[]> => {
          try {
            return fetch(`https://raw.githubusercontent.com/alephium/token-list/master/tokens/${network}.json`).then(
              (r) => r.json().then((j: TokenList) => j.tokens.map((v) => ({ ...v, type: 'fungible', verified: true })))
            )
          } catch (e) {
            console.error(e)
            return Promise.reject(new Error(i18n.t('Verified token fetch failed')))
          }
        },
        staleTime: ONE_DAY_MS
      }),
    unverifiedFungibleToken: (assetId: string) =>
      queryOptions({
        queryKey: ['unverifiedFungibleToken', assetId],
        queryFn: (): Promise<UnverifiedFungibleTokenMetadata> =>
          fungibleTokensMetadata.fetch(assetId).then((r) => {
            const parsedDecimals = r?.decimals ? parseInt(r.decimals) : 0

            return {
              ...r,
              id: assetId,
              type: 'fungible',
              decimals: Number.isInteger(parsedDecimals) ? parsedDecimals : 0,
              verified: false
            }
          }),
        staleTime: ONE_HOUR_MS
      }),
    unverifiedNFT: (assetId: string) =>
      queryOptions({
        queryKey: ['unverifiedNFT', assetId],
        queryFn: (): Promise<UnverifiedNFTMetadata> =>
          unverifiedNFTsMetadata
            .fetch(assetId)
            .then((r) => ({ ...r, id: assetId, type: 'non-fungible', verified: false })),
        staleTime: ONE_HOUR_MS
      }),
    NFTCollection: (collectionId: string) =>
      queryOptions({
        queryKey: ['NFTCollection', collectionId],
        queryFn: (): Promise<NFTCollectionMetadata & { id: string }> =>
          NFTCollectionsMetadata.fetch(addressFromContractId(collectionId)).then((r) => ({ ...r, id: collectionId })),
        staleTime: ONE_HOUR_MS
      })
  },
  NFTsData: {
    type: (dataUri: string) =>
      queryOptions({
        queryKey: ['nftType', dataUri],
        queryFn: (): Promise<NFTDataType> =>
          fetch(dataUri).then((res) => {
            const contentType = res.headers.get('content-type') || ''
            const contentTypeCategory = contentType.split('/')[0]

            return contentTypeCategory in NFTDataTypes ? (contentTypeCategory as NFTDataType) : 'other'
          })
      }),
    item: (dataUri: string, assetId: string) =>
      queryOptions({
        queryKey: ['nftData', dataUri],
        // TODO: Should the image field in NFTTokenUriMetaData be optional?
        queryFn: async (): Promise<NFTTokenUriMetaData & { assetId: string }> => {
          const nftData = (await axios.get(dataUri)).data as NFTTokenUriMetaData

          if (!nftData || !nftData.name) {
            return Promise.reject()
          }

          return matchesNFTTokenUriMetaDataSchema(nftData)
            ? { ...nftData, assetId }
            : nftData.name
              ? {
                  assetId,
                  name: nftData.name,
                  image: nftData.image ? nftData.image.toString() : ''
                }
              : Promise.reject()
        },
        staleTime: ONE_DAY_MS
      }),
    collection: (collectionUri: string, collectionId: string, collectionAddress: string) =>
      queryOptions({
        queryKey: ['nftCollectionData', collectionUri],
        queryFn: ():
          | Promise<NFTCollectionUriMetaData & { collectionId: string; collectionAddress: string }>
          | undefined =>
          fetch(collectionUri).then((res) => res.json().then((f) => ({ ...f, collectionId, collectionAddress }))),
        staleTime: ONE_DAY_MS
      })
  },
  market: {
    tokenPrice: (tokenSymbol: string, currency = 'usd') =>
      queryOptions({
        queryKey: ['tokenPrice', tokenSymbol, currency],
        queryFn: async (): Promise<number> =>
          (await client.explorer.market.postMarketPrices({ currency: 'usd' }, [tokenSymbol]))[0],
        staleTime: ONE_MINUTE_MS
      })
  }
}
