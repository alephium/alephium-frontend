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

import { AddressTokenBalance } from '@alephium/web3/dist/src/api/api-explorer'

import { client } from '@/api/alephiumClient'
import { baseApi } from '@/api/baseApi'
import { PAGINATION_PAGE_LIMIT } from '@/api/limits'
import { ONE_MINUTE_MS } from '@/constants'
import { TokenBalances } from '@/types'

export const addressesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAddressesTokensBalances: build.query<{ addressHash: string; tokenBalances: TokenBalances[] }[], string[]>({
      queryFn: async (addressHashes) => {
        const results = []

        for (const addressHash of addressHashes) {
          const addressTotalTokenBalances = [] as TokenBalances[]
          let addressTokensPageResults = [] as AddressTokenBalance[]
          let page = 1

          while (page === 1 || addressTokensPageResults.length === PAGINATION_PAGE_LIMIT) {
            addressTokensPageResults = await client.explorer.addresses.getAddressesAddressTokensBalance(addressHash, {
              limit: PAGINATION_PAGE_LIMIT,
              page
            })

            addressTotalTokenBalances.push(
              ...addressTokensPageResults.map((token) => ({
                ...token,
                id: token.tokenId
              }))
            )

            page += 1
          }

          results.push({
            addressHash,
            tokenBalances: addressTotalTokenBalances
          })
        }

        return { data: results }
      },
      providesTags: (result, error, addressHashes) =>
        addressHashes.map((hash) => ({
          type: 'AddressTokenBalance',
          hash
        })),
      keepUnusedDataFor: ONE_MINUTE_MS / 1000
    })
  })
})

export const { useGetAddressesTokensBalancesQuery } = addressesApi
