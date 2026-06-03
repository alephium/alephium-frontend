import {
  FREQUENT_ADDRESSES_TRANSACTIONS_REFRESH_INTERVAL,
  INFREQUENT_ADDRESSES_TRANSACTIONS_REFRESH_INTERVAL
} from '@alephium/shared'
import { useQueries } from '@tanstack/react-query'

import { addressLatestTransactionQuery } from '../../api/queries/transactionQueries'
import { useFetchAddressesHashesSplitByUseFrequency } from '../../hooks/addresses/useAddresses'
import { useIsExplorerOnline, useNetworkId } from '../../network/networkHooks'

export const useAddressesDataPolling = () => {
  const { data: splitAddressHashes } = useFetchAddressesHashesSplitByUseFrequency()
  const networkId = useNetworkId()
  const isExplorerOnline = useIsExplorerOnline()

  useQueries({
    queries: splitAddressHashes.frequentlyUsedAddressHashes.map((addressHash) => ({
      ...addressLatestTransactionQuery({ addressHash, networkId, isExplorerOnline }),
      refetchInterval: FREQUENT_ADDRESSES_TRANSACTIONS_REFRESH_INTERVAL,
      notifyOnChangeProps: []
    }))
  })
  useQueries({
    queries: splitAddressHashes.infrequentlyUsedAddressHashes.map((addressHash) => ({
      ...addressLatestTransactionQuery({ addressHash, networkId, isExplorerOnline }),
      refetchInterval: INFREQUENT_ADDRESSES_TRANSACTIONS_REFRESH_INTERVAL,
      notifyOnChangeProps: []
    }))
  })
}
