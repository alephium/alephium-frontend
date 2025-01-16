import { TRANSACTIONS_REFRESH_INTERVAL } from '@alephium/shared'
import { useQueries } from '@tanstack/react-query'

import { addressLatestTransactionQuery } from '@/api/queries/transactionQueries'
import { useAppSelector } from '@/hooks/redux'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

const useAddressesDataPolling = () => {
  const allAddressHashes = useUnsortedAddressesHashes()
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)

  useQueries({
    queries: allAddressHashes.map((addressHash) => ({
      ...addressLatestTransactionQuery({ addressHash, networkId }),
      refetchInterval: TRANSACTIONS_REFRESH_INTERVAL,
      notifyOnChangeProps: []
    }))
  })
}

export default useAddressesDataPolling
