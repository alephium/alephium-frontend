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
import { createContext, ReactNode, useContext, useMemo } from 'react'

import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import useFetchWalletBalancesAlph from '@/api/apiDataHooks/utils/useFetchWalletBalancesAlph'
import { ApiContextProps } from '@/api/apiTypes'
import { AddressAlphBalancesQueryFnData } from '@/api/queries/addressQueries'
import { ApiBalances } from '@/types/tokens'

const useFetchWalletBalancesAlphByAddress = () => useContext(UseFetchWalletBalancesAlphByAddressContext)

export default useFetchWalletBalancesAlphByAddress

export const UseFetchWalletBalancesAlphByAddressContextProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading, isFetching, error } = useFetchWalletBalancesAlph(combineBalancesByAddress)

  const value = useMemo(() => ({ data, isLoading, isFetching, error }), [data, isLoading, isFetching, error])

  return (
    <UseFetchWalletBalancesAlphByAddressContext.Provider value={value}>
      {children}
    </UseFetchWalletBalancesAlphByAddressContext.Provider>
  )
}

const UseFetchWalletBalancesAlphByAddressContext = createContext<
  ApiContextProps<Record<AddressHash, ApiBalances | undefined>>
>({
  data: {},
  isLoading: false,
  isFetching: false,
  error: false
})

const combineBalancesByAddress = (
  results: UseQueryResult<AddressAlphBalancesQueryFnData>[]
): AddressesAlphBalances => ({
  data: results.reduce(
    (acc, { data }) => {
      if (data) {
        acc[data.addressHash] = data.balances
      }
      return acc
    },
    {} as AddressesAlphBalances['data']
  ),
  ...combineIsLoading(results)
})

// Using undefined to avoid adding noUncheckedIndexedAccess in tsconfig while maintaining strong typing when accessing
// values through indexes, ie: alphBalances[addressHash]
export interface AddressesAlphBalances {
  data: Record<AddressHash, ApiBalances | undefined>
  isLoading: boolean
}
