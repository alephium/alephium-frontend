import { ApiBalances, TokenApiBalances, TokenId } from '@alephium/shared'
import { UseQueryResult } from '@tanstack/react-query'

import { combineError, combineIsFetching, combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { useFetchWalletBalancesTokens } from '@/api/apiDataHooks/utils/useFetchWalletBalancesTokens'
import { createDataContext } from '@/api/context/createDataContext'
import { AddressTokensBalancesQueryFnData } from '@/api/queries/addressQueries'

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

const { useData, DataContextProvider } = createDataContext<AddressTokensBalancesQueryFnData, Array<TokenApiBalances>>({
  useDataHook: useFetchWalletBalancesTokens,
  combineFn: combineBalancesToArray,
  defaultValue: []
})

const useFetchWalletBalancesTokensArray = useData
const UseFetchWalletBalancesTokensArrayContextProvider = DataContextProvider

export { useFetchWalletBalancesTokensArray, UseFetchWalletBalancesTokensArrayContextProvider }
