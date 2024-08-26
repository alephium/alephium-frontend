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

import { AddressHash, client, PAGINATION_PAGE_LIMIT } from '@alephium/shared'
import { AddressTokenBalance } from '@alephium/web3/dist/src/api/api-explorer'
import { queryOptions } from '@tanstack/react-query'

import queryClient from '@/api/queryClient'
import { AddressLatestTransactionHashQueryData } from '@/api/transactionQueries'
import { DisplayBalances, TokenDisplayBalances } from '@/types/tokens'

interface AddressBalanceQueryProps extends AddressLatestTransactionHashQueryData {
  networkId: number
}

const ADDRESS_BALANCE_QUERY_KEYS = ['address', 'balance']

export type AddressAlphBalancesQueryFnData = {
  addressHash: AddressHash
  alphBalances: DisplayBalances
}

// Adding latestTxHash in queryKey ensures that we'll refetch when new txs arrive.
// Adding networkId in queryKey ensures that switching the network we get different data.
// TODO: Should we add explorerBackendUrl instead?
export const addressAlphBalancesQuery = ({
  addressHash,
  networkId,
  latestTxHash,
  previousTxHash
}: AddressBalanceQueryProps) => {
  const getQueryOptions = (latestTxHash: AddressBalanceQueryProps['latestTxHash']) =>
    queryOptions({
      queryKey: [...ADDRESS_BALANCE_QUERY_KEYS, 'ALPH', { addressHash, latestTxHash, networkId }],
      queryFn: async (): Promise<AddressAlphBalancesQueryFnData> => {
        const balances = await client.explorer.addresses.getAddressesAddressBalance(addressHash)

        return {
          addressHash,
          alphBalances: {
            totalBalance: BigInt(balances.balance),
            lockedBalance: BigInt(balances.lockedBalance),
            availableBalance: BigInt(balances.balance) - BigInt(balances.lockedBalance)
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

export type AddressTokensBalancesQueryFnData = {
  addressHash: AddressHash
  tokenBalances: TokenDisplayBalances[]
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
      queryFn: async (): Promise<AddressTokensBalancesQueryFnData> => {
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
              totalBalance: BigInt(tokenBalances.balance),
              lockedBalance: BigInt(tokenBalances.lockedBalance),
              availableBalance: BigInt(tokenBalances.balance) - BigInt(tokenBalances.lockedBalance)
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
