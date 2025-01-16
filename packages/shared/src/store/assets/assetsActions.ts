import { TokenList } from '@alephium/token-list'
import { explorer as e, NFTTokenUriMetaData } from '@alephium/web3'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { chunk, groupBy } from 'lodash'
import posthog from 'posthog-js'

import { client } from '@/api/client'
import { exponentialBackoffFetchRetry } from '@/api/fetchRetry'
import { TOKENS_QUERY_LIMIT } from '@/api/limits'
import { matchesNFTTokenUriMetaDataSchema, sanitizeNft } from '@/assets'
import { SharedRootState } from '@/store/store'
import { Asset, FungibleTokenBasicMetadata, NFT } from '@/types/assets'
import { isPromiseFulfilled } from '@/utils'

export const syncVerifiedFungibleTokens = createAsyncThunk(
  'assets/syncVerifiedFungibleTokens',
  async (_, { getState }) => {
    const state = getState() as SharedRootState

    let metadata = undefined
    const network =
      state.network.settings.networkId === 0
        ? 'mainnet'
        : state.network.settings.networkId === 1
          ? 'testnet'
          : undefined

    if (network) {
      const response = await exponentialBackoffFetchRetry(
        `https://raw.githubusercontent.com/alephium/token-list/master/tokens/${network}.json`
      )
      metadata = (await response.json()) as TokenList
    }

    return metadata
  }
)

export const syncUnknownTokensInfo = createAsyncThunk(
  'assets/syncUnknownTokensInfo',
  async (unknownTokenIds: Asset['id'][], { dispatch }) => {
    const tokenTypes = await Promise.all(
      chunk(unknownTokenIds, TOKENS_QUERY_LIMIT).map((unknownTokenIdsChunk) =>
        client.explorer.tokens.postTokens(unknownTokenIdsChunk)
      )
    )

    const grouped = groupBy(tokenTypes.flat(), 'stdInterfaceId')
    const tokenIdsByType = Object.keys(grouped).map((stdInterfaceId) => ({
      stdInterfaceId,
      tokenIds: grouped[stdInterfaceId].map(({ token }) => token)
    }))

    for await (const entry of tokenIdsByType) {
      if (entry.stdInterfaceId === e.TokenStdInterfaceId.Fungible) {
        dispatch(syncFungibleTokensInfo(entry.tokenIds))
      } else if (entry.stdInterfaceId === e.TokenStdInterfaceId.NonFungible) {
        dispatch(syncNFTsInfo(entry.tokenIds))
      }
    }
  }
)

export const syncFungibleTokensInfo = createAsyncThunk(
  'assets/syncFungibleTokensInfo',
  async (tokenIds: Asset['id'][]): Promise<FungibleTokenBasicMetadata[]> => {
    let tokensMetadata: FungibleTokenBasicMetadata[] = []

    try {
      tokensMetadata = (
        await Promise.all(
          chunk(tokenIds, TOKENS_QUERY_LIMIT).map((unknownTokenIdsChunk) =>
            client.explorer.tokens.postTokensFungibleMetadata(unknownTokenIdsChunk)
          )
        )
      )
        .flat()
        .map((token) => {
          const parsedDecimals = parseInt(token.decimals)

          return {
            ...token,
            decimals: Number.isInteger(parsedDecimals) ? parsedDecimals : 0
          }
        })
    } catch (e) {
      console.error(e)
      posthog.capture('Error', { message: 'Syncing unknown fungible tokens info' })
    }

    return tokensMetadata
  }
)

export const syncNFTsInfo = createAsyncThunk('assets/syncNFTsInfo', async (tokenIds: Asset['id'][]): Promise<NFT[]> => {
  let nftsMetadata: e.NFTMetadata[] = []

  try {
    nftsMetadata = (
      await Promise.all(
        chunk(tokenIds, TOKENS_QUERY_LIMIT).map((unknownTokenIdsChunk) =>
          client.explorer.tokens.postTokensNftMetadata(unknownTokenIdsChunk)
        )
      )
    ).flat()
  } catch (e) {
    console.error(e)
    posthog.capture('Error', { message: 'Syncing unknown NFT info' })
  }

  const promiseResults = await Promise.allSettled(
    nftsMetadata.map(async ({ tokenUri, id, collectionId, nftIndex }) => {
      let result
      let data: NFTTokenUriMetaData | undefined

      try {
        result = await exponentialBackoffFetchRetry(tokenUri)
        data = (await result.json()) as NFTTokenUriMetaData

        if (!matchesNFTTokenUriMetaDataSchema(data)) {
          data = undefined
          return Promise.reject()
        }
      } catch (e) {
        if (tokenUri.startsWith('data:application/json;utf8,')) {
          data = JSON.parse(tokenUri.split('data:application/json;utf8,')[1])
        }
      }

      if (data) {
        return { ...data, id, collectionId, nftIndex } as NFT
      } else {
        return Promise.reject()
      }
    })
  )

  const nftsData = promiseResults
    .filter(isPromiseFulfilled)
    .filter((r) => !!r.value)
    .flatMap((r) => sanitizeNft(r.value)) as NFT[]

  return nftsData
})
