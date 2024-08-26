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

import { client, PAGINATION_PAGE_LIMIT, TokenDisplayBalances } from '@alephium/shared'
import { AddressTokenBalance } from '@alephium/web3/dist/src/api/api-explorer'
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
}: AddressBalanceQueryProps) => {
  const getQueryOptions = (latestTxHash: AddressBalanceQueryProps['latestTxHash']) =>
    queryOptions({
      queryKey: [...ADDRESS_BALANCE_QUERY_KEYS, 'ALPH', { addressHash, latestTxHash, networkId }],
      queryFn: async () => {
        const balances = await client.explorer.addresses.getAddressesAddressBalance(addressHash)

        return {
          addressHash,
          balances: {
            balance: BigInt(balances.balance),
            lockedBalance: BigInt(balances.lockedBalance)
          }
        }
      },
      staleTime: Infinity
    })

  const previousQueryKey = getQueryOptions(previousTxHash).queryKey
  const latestQueryOptions = getQueryOptions(latestTxHash)

  return queryOptions({
    ...latestQueryOptions,
    placeholderData: queryClient.getQueryData(previousQueryKey)
  })
}

export const addressTokensBalanceQuery = ({
  addressHash,
  networkId,
  latestTxHash,
  previousTxHash
}: AddressBalanceQueryProps) => {
  const getQueryOptions = (latestTxHash: AddressBalanceQueryProps['latestTxHash']) =>
    queryOptions({
      queryKey: [...ADDRESS_BALANCE_QUERY_KEYS, 'tokens', { addressHash, latestTxHash, networkId }],
      queryFn: async () => {
        const tokenBalances = [] as TokenDisplayBalances[]
        let tokenBalancesInPage = [] as AddressTokenBalance[]
        let page = 1

        while (page === 1 || tokenBalancesInPage.length === PAGINATION_PAGE_LIMIT) {
          tokenBalancesInPage = await client.explorer.addresses.getAddressesAddressTokensBalance(addressHash, {
            limit: PAGINATION_PAGE_LIMIT,
            page
          })

          tokenBalances.push(
            ...tokenBalancesInPage.map((tokenBalances) => ({
              id: tokenBalances.tokenId,
              balance: BigInt(tokenBalances.balance),
              lockedBalance: BigInt(tokenBalances.lockedBalance)
            }))
          )
          page += 1
        }

        return {
          addressHash,
          tokenBalances
        }
      },

      staleTime: Infinity
    })

  const previousQueryKey = getQueryOptions(previousTxHash).queryKey
  const latestQueryOptions = getQueryOptions(latestTxHash)

  return queryOptions({
    ...latestQueryOptions,
    placeholderData: queryClient.getQueryData(previousQueryKey)
  })
}
