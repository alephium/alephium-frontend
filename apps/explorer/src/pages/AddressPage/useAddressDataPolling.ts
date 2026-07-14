import { AddressHash } from '@alephium/shared/types'
import { addressLatestTransactionQuery, useIsExplorerOnline, useNetworkId } from '@alephium/shared-react'
import { useQuery } from '@tanstack/react-query'
import { usePageVisibility } from 'react-page-visibility'

export const ADDRESS_DATA_POLLING_INTERVAL = 10000

interface AddressDataPollingQueryProps {
  addressHash: AddressHash
  networkId: number
  isExplorerOnline: boolean
  isAppVisible: boolean
}

// Polling this one query drives the invalidation that refreshes the whole address page.
export const addressDataPollingQuery = ({
  addressHash,
  networkId,
  isExplorerOnline,
  isAppVisible
}: AddressDataPollingQueryProps) => ({
  ...addressLatestTransactionQuery({ addressHash, networkId, isExplorerOnline }),
  refetchInterval: isAppVisible ? ADDRESS_DATA_POLLING_INTERVAL : undefined,
  notifyOnChangeProps: []
})

export const useAddressDataPolling = (addressHash: AddressHash) => {
  const networkId = useNetworkId()
  const isExplorerOnline = useIsExplorerOnline()
  const isAppVisible = usePageVisibility()

  useQuery(addressDataPollingQuery({ addressHash, networkId, isExplorerOnline, isAppVisible }))
}
