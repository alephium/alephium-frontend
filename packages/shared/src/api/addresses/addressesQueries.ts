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

import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import PQueue from 'p-queue'

import { client, hashArray, PAGINATION_PAGE_LIMIT } from '@/api'

const queue = new PQueue({ concurrency: 1 })
const addToQueue = <T>(fn: () => Promise<T>) => queue.add(fn, { throwOnTimeout: true }) // throwing is needed to avoid returning void

export const addressesQueries = {
  balances: {
    getAddressTokensBalances: (addressHash: string) =>
      queryOptions({
        queryKey: ['getAddressTokensBalances', addressHash],
        queryFn: async () => {
          const addressTotalTokenBalances = []
          let addressTokensPageResults = []
          let page = 1

          while (page === 1 || addressTokensPageResults.length === PAGINATION_PAGE_LIMIT) {
            addressTokensPageResults = await addToQueue(() =>
              client.explorer.addresses.getAddressesAddressTokensBalance(addressHash, {
                limit: PAGINATION_PAGE_LIMIT,
                page
              })
            )

            addressTotalTokenBalances.push(...addressTokensPageResults)

            page += 1
          }

          return addressTotalTokenBalances
        }
      }),
    getAddressAlphBalances: (addressHash: string) =>
      queryOptions({
        queryKey: ['getAddressAlphBalances', addressHash],
        queryFn: async () => await addToQueue(() => client.explorer.addresses.getAddressesAddressBalance(addressHash))
      })
  },
  transactions: {
    getAddressTotalTransactions: (addressHash: string) =>
      queryOptions({
        queryKey: ['getAddressTotalTransactions', addressHash],
        queryFn: async () =>
          await addToQueue(() => client.explorer.addresses.getAddressesAddressTotalTransactions(addressHash))
      }),
    getAddressesTransactions: (addressesHashes: string[] = []) =>
      infiniteQueryOptions({
        queryKey: ['getAddressesTransactions', hashArray(addressesHashes)],
        queryFn: async ({ pageParam }) =>
          await addToQueue(() =>
            client.explorer.addresses.postAddressesTransactions({ page: pageParam, limit: 20 }, addressesHashes)
          ),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages, lastPageParam) => (lastPageParam += 1)
      }),
    getAddressPendingTransactions: (addressHash: string) =>
      queryOptions({
        queryKey: ['getAddressPendingTransactions', addressHash],
        queryFn: async () =>
          await addToQueue(() => client.explorer.addresses.getAddressesAddressMempoolTransactions(addressHash))
      })
  }
}
