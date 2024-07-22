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

import { AddressHash, client, TRANSACTIONS_REFRESH_INTERVAL } from '@alephium/shared'
import { queryOptions } from '@tanstack/react-query'

const ADDRESS_TRANSACTIONS_QUERY_KEYS = ['address', 'transactions']

interface AddressLatestTransactionHashProps {
  addressHash: AddressHash
  networkId: number
}

export const addressLatestTransactionHashQuery = ({ addressHash, networkId }: AddressLatestTransactionHashProps) =>
  queryOptions({
    queryKey: [...ADDRESS_TRANSACTIONS_QUERY_KEYS, 'latest', { addressHash, networkId }],
    queryFn: async () => {
      const transactions = await client.explorer.addresses.getAddressesAddressTransactions(addressHash, {
        page: 1,
        limit: 1
      })

      return {
        addressHash,
        latestTxHash: transactions.length > 0 ? transactions[0].hash : undefined // TODO: Review if needed
      }
    },
    refetchInterval: TRANSACTIONS_REFRESH_INTERVAL
  })
