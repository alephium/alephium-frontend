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

import client from '@/api/client'
import { createQueriesCollection } from '@/utils/api'

export const addressQueries = createQueriesCollection({
  balance: {
    details: (addressHash: string) => ({
      queryKey: ['addressBalance', addressHash],
      queryFn: () => client.explorer.addresses.getAddressesAddressBalance(addressHash)
    })
  },
  transactions: {
    confirmed: (addressHash: string, pageNumber: number, limit = 10) => ({
      queryKey: ['addressConfirmedTransactions', addressHash, pageNumber, limit],
      queryFn: () =>
        client.explorer.addresses.getAddressesAddressTransactions(addressHash, {
          page: pageNumber,
          limit
        })
    }),
    mempool: (addressHash: string) => ({
      queryKey: ['addressPendingTransactions', addressHash],
      queryFn: () => client.explorer.addresses.getAddressesAddressMempoolTransactions(addressHash)
    }),
    txNumber: (addressHash: string) => ({
      queryKey: ['addressTxNumber', addressHash],
      queryFn: () => client.explorer.addresses.getAddressesAddressTotalTransactions(addressHash)
    })
  }
})
