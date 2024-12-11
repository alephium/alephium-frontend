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

import { AddressHash } from '@alephium/shared'
import { useQueries, UseQueryResult } from '@tanstack/react-query'

import { combineError, combineIsFetching, combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { addressTokensBalancesQuery, AddressTokensBalancesQueryFnData } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useAddresses'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'
import { ApiBalances, TokenApiBalances, TokenId } from '@/types/tokens'

export const useFetchWalletBalancesTokensArray = () => useFetchWalletBalancesTokens(combineBalancesToArray)

export const useFetchWalletBalancesTokensByToken = () => useFetchWalletBalancesTokens(combineBalancesByToken)

export const useFetchWalletBalancesTokensByAddress = () => useFetchWalletBalancesTokens(combineBalancesByAddress)

const useFetchWalletBalancesTokens = <T>(
  combine: (results: UseQueryResult<AddressTokensBalancesQueryFnData>[]) => {
    data: T
    isLoading: boolean
    isFetching?: boolean
    error?: boolean
  }
) => {
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)
  const allAddressHashes = useUnsortedAddressesHashes()

  const { data, isLoading, isFetching, error } = useQueries({
    queries: allAddressHashes.map((addressHash) => addressTokensBalancesQuery({ addressHash, networkId })),
    combine
  })

  return {
    data,
    isLoading,
    isFetching,
    error
  }
}

let counter = 0

const combineBalancesByToken = (results: UseQueryResult<AddressTokensBalancesQueryFnData>[]) => {
  console.log('combine balances by token runs', counter++)

  return {
    data: results.reduce(
      (tokensBalances, { data: balances }) => {
        balances?.balances.forEach(({ id, totalBalance, lockedBalance, availableBalance }) => {
          tokensBalances[id] = {
            totalBalance: (BigInt(totalBalance) + BigInt(tokensBalances[id]?.totalBalance ?? 0)).toString(),
            lockedBalance: (BigInt(lockedBalance) + BigInt(tokensBalances[id]?.lockedBalance ?? 0)).toString(),
            availableBalance: (BigInt(availableBalance) + BigInt(tokensBalances[id]?.availableBalance ?? 0)).toString()
          }
        })
        return tokensBalances
      },
      {} as Record<TokenId, ApiBalances | undefined>
    ),
    ...combineIsLoading(results),
    ...combineIsFetching(results),
    ...combineError(results)
  }
}

const combineBalancesByAddress = (results: UseQueryResult<AddressTokensBalancesQueryFnData>[]) => ({
  data: results.reduce(
    (acc, { data }) => {
      if (data) {
        acc[data.addressHash] = data.balances
      }
      return acc
    },
    {} as Record<AddressHash, TokenApiBalances[] | undefined>
  ),
  ...combineIsLoading(results)
})

const combineBalancesToArray = (results: UseQueryResult<AddressTokensBalancesQueryFnData>[]) => {
  const { data: tokenBalancesByToken, isLoading, isFetching, error } = combineBalancesByToken(results)

  return {
    data: Object.keys(tokenBalancesByToken).map((id) => ({
      id,
      ...tokenBalancesByToken[id]
    })) as TokenApiBalances[],
    isLoading,
    isFetching,
    error
  }
}
