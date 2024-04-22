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
import { chunk } from 'lodash'
import posthog from 'posthog-js'

import { baseApi } from '@/api/baseApi'
import { client } from '@/api/alephiumClient'
import { exponentialBackoffFetchRetry } from '@/api/fetchRetry'
import { TOKENS_QUERY_LIMIT } from '@/api/limits'
import { ONE_DAY_MS } from '@/constants'
import { FungibleTokenBasicMetadata, NetworkName } from '@/types'

export const fungibleTokensApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTokenList: build.query<TokenList, NetworkName>({
      queryFn: (networkName) => {
        if (!(['mainnet', 'testnet', 'devnet'] as NetworkName[]).includes(networkName)) {
          return { error: { message: 'Invalid network ' + networkName } }
        }

        return exponentialBackoffFetchRetry(
          `https://raw.githubusercontent.com/alephium/token-list/master/tokens/${networkName}.json`
        ).then((res) => ({
          data: res.json() as unknown as TokenList
        }))
      },
      providesTags: (result, error, networkName) => [{ type: 'TokenList', networkName }],
      keepUnusedDataFor: ONE_DAY_MS / 1000
    }),
    getFungibleTokensMetadata: build.query<FungibleTokenBasicMetadata[], string[]>({
      queryFn: async (tokenIds) => {
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

        return { data: tokensMetadata }
      },
      providesTags: (result, error, tokenIds) =>
        tokenIds.map((id) => ({
          type: 'FungibleTokenBasicMetadata',
          id
        })),
      keepUnusedDataFor: ONE_DAY_MS / 1000
    })
  })
})

export const { useGetTokenListQuery, useGetFungibleTokensMetadataQuery } = fungibleTokensApi
