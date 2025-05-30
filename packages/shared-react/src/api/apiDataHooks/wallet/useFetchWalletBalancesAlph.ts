import { ApiBalances } from '@alephium/shared'
import { UseQueryResult } from '@tanstack/react-query'

import { combineError, combineIsFetching, combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { useFetchWalletBalancesAlphBase } from '@/api/apiDataHooks/utils/useFetchWalletBalancesAlphBase'
import { ApiContextProps } from '@/api/apiTypes'
import { createDataContext } from '@/api/context/createDataContext'
import { AddressAlphBalancesQueryFnData } from '@/api/queries/addressQueries'

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

const { useData: useFetchWalletBalancesAlph, DataContextProvider: UseFetchWalletBalancesAlphContextProvider } =
  createDataContext<AddressAlphBalancesQueryFnData, ApiBalances>({
    useDataHook: useFetchWalletBalancesAlphBase,
    combineFn: combineBalances,
    defaultValue: {
      totalBalance: '0',
      lockedBalance: '0',
      availableBalance: '0'
    }
  })

export { useFetchWalletBalancesAlph, UseFetchWalletBalancesAlphContextProvider }
