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

import { AddressHash, throttledClient, TRANSACTIONS_REFRESH_INTERVAL } from '@alephium/shared'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import { InfiniteData, infiniteQueryOptions, queryOptions, skipToken } from '@tanstack/react-query'

import queryClient from '@/api/queryClient'

const ADDRESS_TRANSACTIONS_QUERY_KEYS = ['address', 'transactions']

interface AddressLatestTransactionHashQueryProps {
  addressHash: AddressHash
  networkId: number
  skip?: boolean
}

export interface AddressLatestTransactionHashQueryFnData {
  addressHash: AddressHash
  latestTxHash?: string
  previousTxHash?: string
}

export const addressLatestTransactionHashQuery = ({
  addressHash,
  networkId,
  skip
}: AddressLatestTransactionHashQueryProps) =>
  queryOptions({
    queryKey: [...ADDRESS_TRANSACTIONS_QUERY_KEYS, 'latest', { addressHash, networkId }],
    queryFn: !skip
      ? async ({ queryKey }) => {
          const transactions = await throttledClient.explorer.addresses.getAddressesAddressTransactions(addressHash, {
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
        }
      : skipToken,
    refetchInterval: TRANSACTIONS_REFRESH_INTERVAL
  })

interface AddressTransactionsInfiniteQueryProps extends AddressLatestTransactionHashQueryFnData {
  networkId: number
}

export const addressTransactionsInfiniteQuery = ({
  addressHash,
  latestTxHash,
  previousTxHash,
  networkId
}: AddressTransactionsInfiniteQueryProps) => {
  const getQueryOptions = (latestTxHash: AddressTransactionsInfiniteQueryProps['latestTxHash']) =>
    infiniteQueryOptions({
      queryKey: ['address', addressHash, 'transactions', { latestTxHash, networkId }],
      queryFn: ({ pageParam }) =>
        throttledClient.explorer.addresses.getAddressesAddressTransactions(addressHash, { page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, _, lastPageParam) => (lastPage.length > 0 ? (lastPageParam += 1) : null),
      staleTime: Infinity
    })

  const previousQueryKey = getQueryOptions(previousTxHash).queryKey
  const latestQueryOptions = getQueryOptions(latestTxHash)

  return infiniteQueryOptions({
    ...latestQueryOptions,
    placeholderData: queryClient.getQueryData(previousQueryKey) as InfiniteData<Transaction[], number> // Casting needed because second argument appears to be `unknown`
  })
}
