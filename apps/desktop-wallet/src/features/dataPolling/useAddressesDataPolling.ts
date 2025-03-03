import { TRANSACTIONS_REFRESH_INTERVAL } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'
import { useQueries } from '@tanstack/react-query'

import { addressLatestTransactionQuery } from '@/api/queries/transactionQueries'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'

const useAddressesDataPolling = () => {
  const allAddressHashes = useUnsortedAddressesHashes()
  const networkId = useCurrentlyOnlineNetworkId()

  useQueries({
    queries: allAddressHashes.map((addressHash) => ({
      ...addressLatestTransactionQuery({ addressHash, networkId }),
      refetchInterval: TRANSACTIONS_REFRESH_INTERVAL,
      notifyOnChangeProps: []
    }))
  })
}

export default useAddressesDataPolling
