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
import { UseQueryResult } from '@tanstack/react-query'

import { DataHook } from '@/api/apiDataHooks/apiDataHooksTypes'
import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { AddressAlphBalancesQueryFnData, AddressTokensBalancesQueryFnData } from '@/api/queries/addressQueries'
import { DisplayBalances, TokenDisplayBalances, TokenId } from '@/types/tokens'

export const combineBalances = (
  results: UseQueryResult<AddressAlphBalancesQueryFnData>[]
): DataHook<DisplayBalances> => ({
  data: results.reduce(
    (totalBalances, { data }) => {
      totalBalances.totalBalance += data ? data.balances.totalBalance : BigInt(0)
      totalBalances.lockedBalance += data ? data.balances.lockedBalance : BigInt(0)
      totalBalances.availableBalance += data ? data.balances.availableBalance : BigInt(0)

      return totalBalances
    },
    {
      totalBalance: BigInt(0),
      lockedBalance: BigInt(0),
      availableBalance: BigInt(0)
    } as DisplayBalances
  ),
  ...combineIsLoading(results)
})

export const combineBalancesByToken = (results: UseQueryResult<AddressTokensBalancesQueryFnData>[]) => ({
  data: results.reduce(
    (tokensBalances, { data: balances }) => {
      balances?.balances.forEach(({ id, totalBalance, lockedBalance, availableBalance }) => {
        tokensBalances[id] = {
          totalBalance: totalBalance + (tokensBalances[id]?.totalBalance ?? BigInt(0)),
          lockedBalance: lockedBalance + (tokensBalances[id]?.lockedBalance ?? BigInt(0)),
          availableBalance: availableBalance + (tokensBalances[id]?.availableBalance ?? BigInt(0))
        }
      })
      return tokensBalances
    },
    {} as Record<TokenId, DisplayBalances | undefined>
  ),
  ...combineIsLoading(results)
})

export const combineBalancesByAddress = (results: UseQueryResult<AddressTokensBalancesQueryFnData>[]) => ({
  data: results.reduce(
    (acc, { data }) => {
      if (data) {
        acc[data.addressHash] = data.balances
      }
      return acc
    },
    {} as Record<AddressHash, TokenDisplayBalances[] | undefined>
  ),
  ...combineIsLoading(results)
})
