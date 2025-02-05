import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { orderBy, uniqBy } from 'lodash'

import { combineIsLoading } from '@/api/apiDataHooks/apiDataHooksUtils'
import { ApiContextProps } from '@/api/apiTypes'
import { createDataContext } from '@/api/context/createDataContext'
import { addressLatestTransactionsQuery } from '@/api/queries/transactionQueries'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import { isDefined } from '@/utils/misc'

const combineFn = (results: UseQueryResult<e.Transaction[]>[]): ApiContextProps<e.Transaction[]> => ({
  data: uniqBy(orderBy(results.flatMap(({ data }) => data).filter(isDefined), 'timestamp', 'desc'), 'hash').slice(0, 5),
  ...combineIsLoading(results)
})

const useDataHook = () => {
  const networkId = useCurrentlyOnlineNetworkId()
  const addressHashes = useUnsortedAddressesHashes()

  const { data: confirmedTxs, isLoading } = useQueries({
    queries:
      networkId !== undefined
        ? addressHashes.map((addressHash) => addressLatestTransactionsQuery({ addressHash, networkId }))
        : [],
    combine: combineFn
  })

  return {
    data: confirmedTxs,
    isLoading
  }
}

const {
  useData: useFetchWalletTransactionsLimited,
  DataContextProvider: UseFetchWalletTransactionsLimitedContextProvider
} = createDataContext<e.Transaction[], e.Transaction[]>({
  useDataHook,
  combineFn,
  defaultValue: []
})

export default useFetchWalletTransactionsLimited
export { UseFetchWalletTransactionsLimitedContextProvider }
