import { AddressHash, ApiBalances, TokenApiBalances } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { UseQueryResult } from '@tanstack/react-query'
import { createContext, ReactNode, useContext, useMemo } from 'react'

import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { useFetchWalletBalancesAlphBase } from '@/api/apiDataHooks/utils/useFetchWalletBalancesAlphBase'
import { useFetchWalletBalancesTokens } from '@/api/apiDataHooks/utils/useFetchWalletBalancesTokens'
import { ApiContextProps } from '@/api/apiTypes'
import { AddressAlphBalancesQueryFnData, AddressTokensBalancesQueryFnData } from '@/api/queries/addressQueries'

const DataContext = createContext<ApiContextProps<Record<AddressHash, Array<TokenApiBalances> | undefined>>>({
  data: {} as Record<AddressHash, Array<TokenApiBalances> | undefined>,
  isLoading: false,
  isFetching: false,
  error: false
})

const UseFetchWalletBalancesByAddressContextProvider = ({ children }: { children: ReactNode }) => {
  const { data: alphBalances, isLoading: isLoadingAlphBalances } =
    useFetchWalletBalancesAlphBase(combineAlphBalancesByAddress)
  const { data: tokensBalances, isLoading: isLoadingTokensBalances } =
    useFetchWalletBalancesTokens(combineTokensBalancesByAddress)

  const allTokensBalances = useMemo(() => {
    const allTokensBalances: Record<AddressHash, TokenApiBalances[]> = {}

    Object.keys(alphBalances).forEach((addressHash) => {
      if (alphBalances[addressHash]) {
        allTokensBalances[addressHash] = [
          { id: ALPH.id, ...alphBalances[addressHash] },
          ...(tokensBalances[addressHash] || [])
        ]
      }
    })

    return allTokensBalances
  }, [alphBalances, tokensBalances])

  const value = useMemo(
    () => ({
      data: allTokensBalances,
      isLoading: isLoadingAlphBalances || isLoadingTokensBalances
    }),
    [allTokensBalances, isLoadingAlphBalances, isLoadingTokensBalances]
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useFetchWalletBalancesByAddress = () => useContext(DataContext)

export { UseFetchWalletBalancesByAddressContextProvider }

type AddressesAlphBalances = ApiContextProps<Record<AddressHash, ApiBalances | undefined>>

const combineAlphBalancesByAddress = (
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

type AddressesTokensBalances = ApiContextProps<Record<AddressHash, TokenApiBalances[] | undefined>>

const combineTokensBalancesByAddress = (
  results: UseQueryResult<AddressTokensBalancesQueryFnData>[]
): AddressesTokensBalances => ({
  data: results.reduce(
    (acc, { data }) => {
      if (data) {
        acc[data.addressHash] = data.balances
      }
      return acc
    },
    {} as AddressesTokensBalances['data']
  ),
  ...combineIsLoading(results)
})
