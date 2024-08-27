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

import queryClient from '@/api/queryClient'

const ADDRESS_TRANSACTIONS_QUERY_KEYS = ['address', 'transactions']

interface AddressLatestTransactionHashQueryProps {
  addressHash: AddressHash
  networkId: number
}

export interface AddressLatestTransactionHashQueryFnData {
  addressHash: AddressHash
  latestTxHash?: string
  previousTxHash?: string
}

export const addressLatestTransactionHashQuery = ({ addressHash, networkId }: AddressLatestTransactionHashQueryProps) =>
  queryOptions({
    queryKey: [...ADDRESS_TRANSACTIONS_QUERY_KEYS, 'latest', { addressHash, networkId }],
    queryFn: async ({ queryKey }): Promise<AddressLatestTransactionHashQueryFnData> => {
      const transactions = await client.explorer.addresses.getAddressesAddressTransactions(addressHash, {
        page: 1,
        limit: 1
      })

      const latestTxHash = transactions.length > 0 ? transactions[0].hash : undefined
      const cachedData = queryClient.getQueryData(queryKey) as AddressLatestTransactionHashQueryFnData | undefined
      const cachedLatestTxHash = cachedData?.latestTxHash
      const cachedPreviousTxHash = cachedData?.previousTxHash

      return {
        addressHash,
        latestTxHash,
        previousTxHash: cachedLatestTxHash !== latestTxHash ? cachedLatestTxHash : cachedPreviousTxHash
      }
    },
    refetchInterval: TRANSACTIONS_REFRESH_INTERVAL
  })
