import { AddressHash } from '@alephium/shared'
import { UseQueryResult } from '@tanstack/react-query'

import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import useFetchWalletBalancesAlphBase from '@/api/apiDataHooks/utils/useFetchWalletBalancesAlphBase'
import { ApiContextProps } from '@/api/apiTypes'
import { createDataContext } from '@/api/context/createDataContext'
import { AddressAlphBalancesQueryFnData } from '@/api/queries/addressQueries'
import { ApiBalances } from '@/types/tokens'

// Using undefined to avoid adding noUncheckedIndexedAccess in tsconfig while maintaining strong typing when accessing
// values through indexes, ie: alphBalances[addressHash]
type AddressesAlphBalances = ApiContextProps<Record<AddressHash, ApiBalances | undefined>>

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

const {
  useData: useFetchWalletBalancesAlphByAddress,
  DataContextProvider: UseFetchWalletBalancesAlphByAddressContextProvider
} = createDataContext<AddressAlphBalancesQueryFnData, AddressesAlphBalances['data']>({
  useDataHook: useFetchWalletBalancesAlphBase,
  combineFn: combineBalancesByAddress,
  defaultValue: {}
})

export default useFetchWalletBalancesAlphByAddress
export { UseFetchWalletBalancesAlphByAddressContextProvider }
