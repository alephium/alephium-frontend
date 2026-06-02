import { useQueries } from '@tanstack/react-query'

import { flatMapCombine } from '../../../api/apiDataHooks/apiDataHooksUtils'
import { addressNftsQuery } from '../../../api/queries/addressQueries'
import { useUnsortedAddressesHashes } from '../../../hooks'
import { useIsNodeOnline, useNetworkId } from '../../../network/networkHooks'

export const useFetchWalletNfts = () => {
  const addressHashes = useUnsortedAddressesHashes()
  const networkId = useNetworkId()
  const isNodeOnline = useIsNodeOnline()

  const { data, isLoading } = useQueries({
    queries: addressHashes.map((addressHash) => addressNftsQuery({ addressHash, networkId, isNodeOnline })),
    combine: flatMapCombine
  })

  return { data, isLoading }
}
