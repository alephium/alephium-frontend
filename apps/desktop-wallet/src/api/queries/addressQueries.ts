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

import { AddressHash, PAGINATION_PAGE_LIMIT, throttledClient } from '@alephium/shared'
import { AddressTokenBalance } from '@alephium/web3/dist/src/api/api-explorer'
import { queryOptions, skipToken } from '@tanstack/react-query'

import { SkipProp } from '@/api/apiDataHooks/types'
import { AddressLatestTransactionHashQueryFnData } from '@/api/queries/transactionQueries'
import queryClient from '@/api/queryClient'
import { DisplayBalances, TokenDisplayBalances, TokenId } from '@/types/tokens'

interface AddressBalanceQueryProps extends AddressLatestTransactionHashQueryFnData, SkipProp {
  networkId: number
}

const ADDRESS_BALANCE_QUERY_KEYS = ['address', 'balance']

export type AddressAlphBalancesQueryFnData = {
  addressHash: AddressHash
  balances: DisplayBalances
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
      queryFn: async () => {
        const balances = await throttledClient.explorer.addresses.getAddressesAddressBalance(addressHash)

        return {
          addressHash,
          balances: {
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

interface AddressTokenBalancesQueryProps extends AddressBalanceQueryProps {
  tokenId: TokenId
}

export const addressSingleTokenBalancesQuery = ({
  addressHash,
  tokenId,
  networkId,
  latestTxHash,
  previousTxHash
}: AddressTokenBalancesQueryProps) => {
  const getQueryOptions = (latestTxHash: AddressBalanceQueryProps['latestTxHash']) =>
    queryOptions({
      queryKey: [...ADDRESS_BALANCE_QUERY_KEYS, { addressHash, tokenId, latestTxHash, networkId }],
      queryFn: async () => {
        const balances = await throttledClient.explorer.addresses.getAddressesAddressTokensTokenIdBalance(
          addressHash,
          tokenId
        )

        return {
          addressHash,
          balances: {
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
  balances: TokenDisplayBalances[]
}

export const addressTokensBalancesQuery = ({
  addressHash,
  networkId,
  latestTxHash,
  previousTxHash,
  skip
}: AddressBalanceQueryProps) => {
  const getQueryOptions = (latestTxHash: AddressBalanceQueryProps['latestTxHash']) =>
    queryOptions({
      queryKey: [...ADDRESS_BALANCE_QUERY_KEYS, 'tokens', { addressHash, latestTxHash, networkId }],
      queryFn: !skip
        ? async () => {
            const tokenBalances = [] as TokenDisplayBalances[]
            let tokenBalancesInPage = [] as AddressTokenBalance[]
            let page = 1

            while (page === 1 || tokenBalancesInPage.length === PAGINATION_PAGE_LIMIT) {
              tokenBalancesInPage = await throttledClient.explorer.addresses.getAddressesAddressTokensBalance(
                addressHash,
                {
                  limit: PAGINATION_PAGE_LIMIT,
                  page
                }
              )

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
              balances: tokenBalances
            }
          }
        : skipToken,

      staleTime: Infinity
    })

  const previousQueryKey = getQueryOptions(previousTxHash).queryKey
  const latestQueryOptions = getQueryOptions(latestTxHash)

  return queryOptions({
    ...latestQueryOptions,
    placeholderData: queryClient.getQueryData(previousQueryKey)
  })
}
