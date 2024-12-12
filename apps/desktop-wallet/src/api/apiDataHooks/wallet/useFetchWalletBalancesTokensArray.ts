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
import { useFetchWalletBalancesTokens } from '@/api/apiDataHooks/utils/useFetchWalletBalancesTokens'
import { createDataContext } from '@/api/context/createDataContext'
import { AddressTokensBalancesQueryFnData } from '@/api/queries/addressQueries'
import { ApiBalances, TokenApiBalances, TokenId } from '@/types/tokens'

const combineBalancesToArray = (results: UseQueryResult<AddressTokensBalancesQueryFnData>[]) => {
  const tokenBalancesByToken = results.reduce(
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
  )

  return {
    data: Object.keys(tokenBalancesByToken).map((id) => ({
      id,
      ...tokenBalancesByToken[id]
    })) as TokenApiBalances[],
    ...combineIsLoading(results),
    ...combineIsFetching(results),
    ...combineError(results)
  }
}

const {
  useData: useFetchWalletBalancesTokensArray,
  DataContextProvider: UseFetchWalletBalancesTokensArrayContextProvider
} = createDataContext<AddressTokensBalancesQueryFnData, TokenApiBalances[]>({
  useDataHook: useFetchWalletBalancesTokens,
  combineFn: combineBalancesToArray,
  defaultValue: []
})

export default useFetchWalletBalancesTokensArray
export { UseFetchWalletBalancesTokensArrayContextProvider }
