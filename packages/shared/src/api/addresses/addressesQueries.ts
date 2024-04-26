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
import { queryOptions } from '@tanstack/react-query'

import { client, PAGINATION_PAGE_LIMIT } from '@/api'
import { TokenBalances } from '@/types'

export const addressesQueries = {
  balances: {
    getAddressTokensBalances: (addressHash: string) =>
      queryOptions({
        queryKey: ['getAddressTokensBalances', addressHash],
        queryFn: async () => {
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

          return addressTotalTokenBalances
        }
      })
  }
}
