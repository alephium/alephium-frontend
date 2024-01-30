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

import { Asset, SyncUnknownTokensInfoResult, TOKENS_QUERY_LIMIT } from '@alephium/shared'
import { TokenList } from '@alephium/token-list'
import { explorer } from '@alephium/web3'
import { createAction, createAsyncThunk } from '@reduxjs/toolkit'
import { chunk, groupBy } from 'lodash'
import posthog from 'posthog-js'

import client from '@/api/client'
import { exponentialBackoffFetchRetry } from '@/api/fetchRetry'
import { RootState } from '@/storage/store'

export const loadingStarted = createAction('assets/loadingStarted')

export const syncNetworkTokensInfo = createAsyncThunk(
  'assets/syncNetworkTokensInfo',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState

    dispatch(loadingStarted())

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
  async (unknownTokenIds: Asset['id'][], { dispatch }): Promise<SyncUnknownTokensInfoResult> => {
    const results = {
      tokens: [],
      nfts: []
    } as SyncUnknownTokensInfoResult

    dispatch(loadingStarted())

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

    try {
      for await (const entry of tokenIdsByType) {
        if (entry.stdInterfaceId === explorer.TokenStdInterfaceId.Fungible) {
          results.tokens = (
            await Promise.all(
              chunk(entry.tokenIds, TOKENS_QUERY_LIMIT).map((unknownTokenIdsChunk) =>
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
        } else if (entry.stdInterfaceId === explorer.TokenStdInterfaceId.NonFungible) {
          const nftResults = (
            await Promise.all(
              chunk(entry.tokenIds, TOKENS_QUERY_LIMIT).map((unknownTokenIdsChunk) =>
                client.explorer.tokens.postTokensNftMetadata(unknownTokenIdsChunk)
              )
            )
          ).flat()

          for await (const { tokenUri, id, collectionId } of nftResults) {
            const nftData = await exponentialBackoffFetchRetry(tokenUri).then((res) => res.json())

            results.nfts.push({
              id,
              collectionId,
              name: nftData?.name,
              description: nftData?.description,
              image: nftData?.image
            })
          }
        }
      }
    } catch (e) {
      console.error(e)
      posthog.capture('Error', { message: 'Syncing unknown tokens info' })
    }

    return results
  }
)
