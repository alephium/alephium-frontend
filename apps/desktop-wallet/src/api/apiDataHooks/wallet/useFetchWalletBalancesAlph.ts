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

import { SkipProp } from '@/api/apiDataHooks/apiDataHooksTypes'
import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { combineBalances } from '@/api/apiDataHooks/wallet/combineBalances'
import { addressAlphBalancesQuery, AddressAlphBalancesQueryFnData } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddressHashes } from '@/storage/addresses/addressesSelectors'
import { DisplayBalances } from '@/types/tokens'

// Using undefined to avoid adding noUncheckedIndexedAccess in tsconfig while maintaining strong typing when accessing
// values through indexes, ie: alphBalances[addressHash]
export interface AddressesAlphBalances {
  data: Record<AddressHash, DisplayBalances | undefined>
  isLoading: boolean
}

export const useFetchWalletBalancesAlphArray = (props?: SkipProp) =>
  useFetchWalletBalancesAlph({ combine: combineBalances, skip: props?.skip })

export const useFetchWalletBalancesAlphByAddress = (props?: SkipProp) =>
  useFetchWalletBalancesAlph({ combine: combineBalancesByAddress, skip: props?.skip })

interface UseFetchWalletBalancesAlphProps<T> extends SkipProp {
  combine: (results: UseQueryResult<AddressAlphBalancesQueryFnData>[]) => { data: T; isLoading: boolean }
}

const useFetchWalletBalancesAlph = <T>({ combine, skip }: UseFetchWalletBalancesAlphProps<T>) => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const allAddressHashes = useAppSelector(selectAllAddressHashes)

  return useQueries({
    queries: allAddressHashes.map((addressHash) => addressAlphBalancesQuery({ addressHash, networkId, skip })),
    combine
  })
}

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
