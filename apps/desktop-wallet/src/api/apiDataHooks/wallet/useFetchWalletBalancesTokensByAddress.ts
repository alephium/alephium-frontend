import { AddressHash } from '@alephium/shared'
import { UseQueryResult } from '@tanstack/react-query'

import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { useFetchWalletBalancesTokens } from '@/api/apiDataHooks/utils/useFetchWalletBalancesTokens'
import { ApiContextProps } from '@/api/apiTypes'
import { createDataContext } from '@/api/context/createDataContext'
import { AddressTokensBalancesQueryFnData } from '@/api/queries/addressQueries'
import { TokenApiBalances } from '@/types/tokens'

type AddressesTokensBalances = ApiContextProps<Record<AddressHash, TokenApiBalances[] | undefined>>

const combineBalancesByAddress = (
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

const {
  useData: useFetchWalletBalancesTokensByAddress,
  DataContextProvider: UseFetchWalletBalancesTokensByAddressContextProvider
} = createDataContext<AddressTokensBalancesQueryFnData, AddressesTokensBalances['data']>({
  useDataHook: useFetchWalletBalancesTokens,
  combineFn: combineBalancesByAddress,
  defaultValue: {}
})

export default useFetchWalletBalancesTokensByAddress
export { UseFetchWalletBalancesTokensByAddressContextProvider }
