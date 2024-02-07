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
import { explorer } from '@alephium/web3'
import { NFTMetadata } from '@alephium/web3/dist/src/api/api-explorer'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { chunk, groupBy } from 'lodash'
import posthog from 'posthog-js'

import { client } from '@/api/client'
import { exponentialBackoffFetchRetry } from '@/api/fetchRetry'
import { TOKENS_QUERY_LIMIT } from '@/api/limits'
import { SharedRootState } from '@/store/store'
import { Asset, FungibleTokenBasicMetadata, NFT } from '@/types/assets'
import { isFulfilled } from '@/utils'

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
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/alephium/token-list/master/tokens/${network}.json`
        )
        metadata = (await response.json()) as TokenList
      } catch (e) {
        console.warn('No metadata for network ID ', state.network.settings.networkId)
        posthog.capture('Error', { message: `No metadata for network ID ${state.network.settings.networkId}` })
      }
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
      if (entry.stdInterfaceId === explorer.TokenStdInterfaceId.Fungible) {
        dispatch(syncFungibleTokensInfo(entry.tokenIds))
      } else if (entry.stdInterfaceId === explorer.TokenStdInterfaceId.NonFungible) {
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
  let nfts: NFT[] = []
  let nftsMetadata: NFTMetadata[] = []

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
    nftsMetadata.map(({ tokenUri, id }) =>
      exponentialBackoffFetchRetry(tokenUri)
        .then((res) => res.json())
        .then((data) => ({ ...data, id }))
    )
  )
  const nftsData = promiseResults.filter(isFulfilled).flatMap((r) => r.value)

  nfts = nftsMetadata.map(({ id, collectionId }) => ({
    id,
    collectionId,
    ...(nftsData.find((nftData) => nftData.id === id) || {})
  }))

  return nfts
})
