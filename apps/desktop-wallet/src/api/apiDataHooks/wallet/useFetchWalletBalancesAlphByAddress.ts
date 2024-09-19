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

import { combineIsLoading } from '@/api/apiDataHooks/utils'
import useFetchWalletLastTransactionHashes from '@/api/apiDataHooks/wallet/useFetchWalletLastTransactionHashes'
import { addressAlphBalancesQuery, AddressAlphBalancesQueryFnData } from '@/api/queries/addressQueries'
import { useAppSelector } from '@/hooks/redux'
import { DisplayBalances } from '@/types/tokens'

// Using undefined to avoid adding noUncheckedIndexedAccess in tsconfig while maintaining strong typing when accessing
// values through indexes, ie: alphBalances[addressHash]
export interface AddressesAlphBalances {
  data: Record<AddressHash, DisplayBalances | undefined>
  isLoading: boolean
}

const useFetchWalletBalancesAlphByAddress = (): AddressesAlphBalances => {
  const { data: latestTxHashes, isLoading: isLoadingLatestTxHashes } = useFetchWalletLastTransactionHashes()
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  const { data, isLoading } = useQueries({
    queries: latestTxHashes.map(({ addressHash, latestTxHash, previousTxHash }) =>
      addressAlphBalancesQuery({ addressHash, latestTxHash, previousTxHash, networkId })
    ),
    combine
  })

  return {
    data,
    isLoading: isLoading || isLoadingLatestTxHashes
  }
}

export default useFetchWalletBalancesAlphByAddress

const combine = (results: UseQueryResult<AddressAlphBalancesQueryFnData>[]): AddressesAlphBalances => ({
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
