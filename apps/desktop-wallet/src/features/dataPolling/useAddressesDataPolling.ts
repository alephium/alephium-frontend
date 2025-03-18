import {
  FREQUENT_ADDRESS_TRANSACTIONS_REFRESH_INTERVAL,
  INFREQUENT_ADDRESS_TRANSACTIONS_REFRESH_INTERVAL
} from '@alephium/shared'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQueries } from '@tanstack/react-query'

import { addressLatestTransactionQuery } from '@/api/queries/transactionQueries'
import { useFetchAddressesHashesSplitByUseFrequency } from '@/hooks/useAddresses'

const useAddressesDataPolling = () => {
  const { data: splitAddressHashes } = useFetchAddressesHashesSplitByUseFrequency()
  const networkId = useCurrentlyOnlineNetworkId()

  useQueries({
    queries: splitAddressHashes.frequentlyUsedAddressHashes.map((addressHash) => ({
      ...addressLatestTransactionQuery({ addressHash, networkId }),
      refetchInterval: FREQUENT_ADDRESS_TRANSACTIONS_REFRESH_INTERVAL,
      notifyOnChangeProps: []
    }))
  })
  useQueries({
    queries: splitAddressHashes.infrequentlyUsedAddressHashes.map((addressHash) => ({
      ...addressLatestTransactionQuery({ addressHash, networkId }),
      refetchInterval: INFREQUENT_ADDRESS_TRANSACTIONS_REFRESH_INTERVAL,
      notifyOnChangeProps: []
    }))
  })
}

export default useAddressesDataPolling
