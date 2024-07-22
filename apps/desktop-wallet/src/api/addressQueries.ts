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

import { client, PAGINATION_PAGE_LIMIT } from '@alephium/shared'
import { AddressBalance, AddressTokenBalance } from '@alephium/web3/dist/src/api/api-explorer'
import { queryOptions } from '@tanstack/react-query'

import queryClient from '@/api/queryClient'
import { AddressLatestTransactionHashQueryData } from '@/api/transactionQueries'

interface AddressBalanceQueryProps extends AddressLatestTransactionHashQueryData {
  networkId: number
}

const ADDRESS_BALANCE_QUERY_KEYS = ['address', 'balance']

// Adding latestTxHash in queryKey ensures that we'll refetch when new txs arrive.
// Adding networkId in queryKey ensures that switching the network we get different data.
// TODO: Should we add explorerBackendUrl instead?
export const addressAlphBalanceQuery = ({
  addressHash,
  networkId,
  latestTxHash,
  previousTxHash
}: AddressBalanceQueryProps) =>
  queryOptions({
    queryKey: [...ADDRESS_BALANCE_QUERY_KEYS, 'ALPH', { addressHash, latestTxHash, networkId }],
    queryFn: () => client.explorer.addresses.getAddressesAddressBalance(addressHash),
    placeholderData: queryClient.getQueryData([
      ...ADDRESS_BALANCE_QUERY_KEYS,
      'ALPH',
      { addressHash, latestTxHash: previousTxHash, networkId }
    ]) as AddressBalance,
    staleTime: Infinity
  })

export const addressTokensBalanceQuery = ({
  addressHash,
  networkId,
  latestTxHash,
  previousTxHash
}: AddressBalanceQueryProps) =>
  queryOptions({
    queryKey: [...ADDRESS_BALANCE_QUERY_KEYS, 'tokens', { addressHash, latestTxHash, networkId }],
    queryFn: async () => {
      const tokenBalances = [] as AddressTokenBalance[]
      let tokenBalancesInPage = [] as AddressTokenBalance[]
      let page = 1

      while (page === 1 || tokenBalancesInPage.length === PAGINATION_PAGE_LIMIT) {
        tokenBalancesInPage = await client.explorer.addresses.getAddressesAddressTokensBalance(addressHash, {
          limit: PAGINATION_PAGE_LIMIT,
          page
        })

        tokenBalances.push(...tokenBalancesInPage)
        page += 1
      }

      return tokenBalances
    },
    placeholderData: queryClient.getQueryData([
      ...ADDRESS_BALANCE_QUERY_KEYS,
      'tokens',
      { addressHash, latestTxHash: previousTxHash, networkId }
    ]) as AddressTokenBalance[],
    staleTime: Infinity
  })
