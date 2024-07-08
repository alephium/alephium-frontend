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

import { PAGINATION_PAGE_LIMIT } from '@alephium/shared'
import { queryOptions } from '@tanstack/react-query'

import client from '@/api/client'
import { browsePages } from '@/utils/api'

export const addressQueries = {
  balance: {
    details: (addressHash: string) =>
      queryOptions({
        queryKey: ['addressBalance', addressHash],
        queryFn: () => client.explorer.addresses.getAddressesAddressBalance(addressHash)
      })
  },
  transactions: {
    confirmed: (addressHash: string, pageNumber: number, limit = 10) =>
      queryOptions({
        queryKey: ['addressConfirmedTransactions', addressHash, pageNumber, limit],
        queryFn: () =>
          client.explorer.addresses.getAddressesAddressTransactions(addressHash, {
            page: pageNumber,
            limit
          })
      }),
    mempool: (addressHash: string) =>
      queryOptions({
        queryKey: ['addressPendingTransactions', addressHash],
        queryFn: () => client.explorer.addresses.getAddressesAddressMempoolTransactions(addressHash)
      }),
    txNumber: (addressHash: string) =>
      queryOptions({
        queryKey: ['addressTxNumber', addressHash],
        queryFn: () => client.explorer.addresses.getAddressesAddressTotalTransactions(addressHash)
      })
  },
  assets: {
    tokensBalance: (addressHash: string) =>
      queryOptions({
        queryKey: ['addressTokensBalance', addressHash],
        queryFn: async () =>
          browsePages(client.explorer.addresses.getAddressesAddressTokensBalance, addressHash, PAGINATION_PAGE_LIMIT)
      })
  }
}
