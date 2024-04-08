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
import { NetworkId } from '@alephium/web3'

import { baseApi } from '@/api/baseApi'
import { exponentialBackoffFetchRetry } from '@/api/fetchRetry'
import { ONE_DAY_MS } from '@/constants'

export const fungibleTokensApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTokenListFungibleTokens: build.query<TokenList, NetworkId>({
      queryFn: (networkId) => {
        if (!(['mainnet', 'testnet'] as NetworkId[]).includes(networkId)) {
          return { error: { message: 'Invalid networkId' } }
        }

        return exponentialBackoffFetchRetry(
          `https://raw.githubusercontent.com/alephium/token-list/master/tokens/${networkId}.json`
        ).then((res) => ({
          data: res.json() as unknown as TokenList
        }))
      },
      providesTags: (result, error, networkId) => [{ type: 'TokenList', networkId }],
      keepUnusedDataFor: ONE_DAY_MS / 1000
    })
  })
})

export const { useGetTokenListFungibleTokensQuery } = fungibleTokensApi
