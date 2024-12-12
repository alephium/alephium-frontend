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

import { UseQueryResult } from '@tanstack/react-query'

import { combineError, combineIsFetching, combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import useFetchWalletBalancesAlph from '@/api/apiDataHooks/utils/useFetchWalletBalancesAlph'
import { ApiContextProps } from '@/api/apiTypes'
import { createDataContext } from '@/api/context/createDataContext'
import { AddressAlphBalancesQueryFnData } from '@/api/queries/addressQueries'
import { ApiBalances } from '@/types/tokens'

const combineBalances = (results: UseQueryResult<AddressAlphBalancesQueryFnData>[]): ApiContextProps<ApiBalances> => ({
  data: results.reduce(
    (totalBalances, { data }) => {
      totalBalances.totalBalance = (
        BigInt(totalBalances.totalBalance) + BigInt(data?.balances.totalBalance ?? '0')
      ).toString()
      totalBalances.lockedBalance = (
        BigInt(totalBalances.lockedBalance) + BigInt(data?.balances.lockedBalance ?? '0')
      ).toString()
      totalBalances.availableBalance = (
        BigInt(totalBalances.availableBalance) + BigInt(data?.balances.availableBalance ?? '0')
      ).toString()

      return totalBalances
    },
    {
      totalBalance: '0',
      lockedBalance: '0',
      availableBalance: '0'
    } as ApiBalances
  ),
  ...combineIsLoading(results),
  ...combineIsFetching(results),
  ...combineError(results)
})

const {
  useData: useFetchWalletBalancesAlphArray,
  DataContextProvider: UseFetchWalletBalancesAlphArrayContextProvider
} = createDataContext<AddressAlphBalancesQueryFnData, ApiBalances>({
  useDataHook: useFetchWalletBalancesAlph,
  combineFn: combineBalances,
  defaultValue: {
    totalBalance: '0',
    lockedBalance: '0',
    availableBalance: '0'
  }
})

export default useFetchWalletBalancesAlphArray
export { UseFetchWalletBalancesAlphArrayContextProvider }
