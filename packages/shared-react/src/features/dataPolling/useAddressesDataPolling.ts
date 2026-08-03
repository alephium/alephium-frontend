import { ADDRESSES_TRANSACTIONS_REFRESH_INTERVAL } from '@alephium/shared'
import { useQueries } from '@tanstack/react-query'

import { addressLatestTransactionQuery } from '../../api/queries/transactionQueries'
import { useUnsortedAddressesHashes } from '../../hooks/addresses/useUnsortedAddresses'
import { useIsExplorerOnline, useNetworkId } from '../../network/networkHooks'

export const useAddressesDataPolling = () => {
  const addressHashes = useUnsortedAddressesHashes()
  const networkId = useNetworkId()
  const isExplorerOnline = useIsExplorerOnline()

  useQueries({
    queries: addressHashes.map((addressHash) => ({
      ...addressLatestTransactionQuery({ addressHash, networkId, isExplorerOnline }),
      refetchInterval: ADDRESSES_TRANSACTIONS_REFRESH_INTERVAL,
      notifyOnChangeProps: []
    }))
  })
}
