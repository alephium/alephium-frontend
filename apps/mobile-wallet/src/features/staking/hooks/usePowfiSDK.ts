import { useMemo } from 'react'

import { getPowfiSdk, networkIdToPowfiNetworkId } from '~/api/powfi'
import { useAppSelector } from '~/hooks/redux'

/** Subscribes to wallet network settings; returns Powfi staking module and network config for that RPC/explorer pair. */
const usePowfiSDK = () => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)
  const nodeHost = useAppSelector((s) => s.network.settings.nodeHost)
  const explorerApiHost = useAppSelector((s) => s.network.settings.explorerApiHost)

  return useMemo(() => {
    const powfi = getPowfiSdk(networkIdToPowfiNetworkId(networkId), { nodeHost, explorerApiHost })
    return { staking: powfi.staking, network: powfi.network }
  }, [networkId, nodeHost, explorerApiHost])
}

export default usePowfiSDK
