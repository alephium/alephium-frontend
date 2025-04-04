import { useQueries } from '@tanstack/react-query'

import { flatMapCombine } from '@/api/apiDataHooks/apiDataHooksUtils'
import { addressNftsQuery } from '@/api/queries/addressQueries'
import { useUnsortedAddressesHashes } from '@/hooks'
import { useCurrentlyOnlineNetworkId } from '@/network'

export const useFetchWalletNfts = () => {
  const addressHashes = useUnsortedAddressesHashes()
  const networkId = useCurrentlyOnlineNetworkId()

  const { data, isLoading } = useQueries({
    queries: addressHashes.map((addressHash) => addressNftsQuery({ addressHash, networkId })),
    combine: flatMapCombine
  })

  return { data, isLoading }
}
