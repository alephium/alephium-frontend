import { FOREGROUND_ADDRESS_TRANSACTIONS_REFRESH_INTERVAL } from '@alephium/shared'
import { AddressHash } from '@alephium/shared/types'
import { useQuery } from '@tanstack/react-query'

import { addressLatestTransactionQuery } from '../../api/queries/transactionQueries'
import { useIsExplorerOnline, useNetworkId } from '../../network/networkHooks'

// Must keep the queryKey the global poller uses: this works by sharing that cache entry, where the shortest
// refetchInterval among the mounted observers wins.
export const useForegroundAddressPolling = (addressHash: AddressHash | undefined) => {
  const networkId = useNetworkId()
  const isExplorerOnline = useIsExplorerOnline()

  useQuery({
    ...addressLatestTransactionQuery({ addressHash: addressHash ?? '', networkId, isExplorerOnline }),
    refetchInterval: FOREGROUND_ADDRESS_TRANSACTIONS_REFRESH_INTERVAL,
    notifyOnChangeProps: [],
    enabled: !!addressHash
  })
}
