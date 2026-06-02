import {
  addressSearchStringQuery,
  useIsNodeOnline,
  useNetworkId,
  useUnsortedAddressesHashes
} from '@alephium/shared-react'
import { useQueries } from '@tanstack/react-query'

// This hook can be used to build caches of expensive queries outside of where the queries are used. This way the UI
// thread does not get blocked when the components that use these queries are first rendered.
// See: https://tanstack.com/query/latest/docs/framework/react/guides/prefetching#prefetch-in-components
const usePrefetchQueries = () => {
  const addressHashes = useUnsortedAddressesHashes()
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()

  useQueries({
    queries: addressHashes.map((hash) => ({
      ...addressSearchStringQuery({ addressHash: hash, networkId, isNodeOnline }),
      notifyOnChangeProps: []
    }))
  })
}

export default usePrefetchQueries
