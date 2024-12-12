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

import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { useFetchWalletBalancesTokens } from '@/api/apiDataHooks/utils/useFetchWalletBalancesTokens'
import { createDataContext } from '@/api/context/createDataContext'
import { AddressTokensBalancesQueryFnData } from '@/api/queries/addressQueries'
import { TokenApiBalances } from '@/types/tokens'

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

const {
  useData: useFetchWalletBalancesTokensByAddress,
  DataContextProvider: UseFetchWalletBalancesTokensByAddressContextProvider
} = createDataContext<AddressTokensBalancesQueryFnData, Record<AddressHash, TokenApiBalances[] | undefined>>({
  useDataHook: useFetchWalletBalancesTokens,
  combineFn: combineBalancesByAddress,
  defaultValue: {}
})

export default useFetchWalletBalancesTokensByAddress
export { UseFetchWalletBalancesTokensByAddressContextProvider }
