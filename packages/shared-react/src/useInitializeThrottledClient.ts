import { apiClientInitFailed, apiClientInitSucceeded, batchers, throttledClient } from '@alephium/shared'
import { useCallback, useEffect } from 'react'

import { useSharedDispatch, useSharedSelector } from '@/redux'
import { useInterval } from '@/useInterval'

const CLIENT_INIT_RETRY_INTERVAL = 2000

export const useInitializeThrottledClient = () => {
  const network = useSharedSelector((s) => s.network)
  const dispatch = useSharedDispatch()

  const shouldStopTryingToInitializeClient = network.status !== 'offline'

  const initializeClient = useCallback(async () => {
    try {
      throttledClient.init(network.settings.nodeHost, network.settings.explorerApiHost)
      batchers.init()
      const { networkId } = await throttledClient.node.infos.getInfosChainParams()
      await throttledClient.explorer.infos.getInfos()
      dispatch(apiClientInitSucceeded({ networkId, networkName: network.name }))
    } catch (e) {
      console.error(e)
      dispatch(apiClientInitFailed({ networkName: network.name }))
    }
  }, [network.settings.nodeHost, network.settings.explorerApiHost, network.name, dispatch])

  useEffect(() => {
    if (network.status === 'connecting') {
      initializeClient()
    }
  }, [initializeClient, network.status])

  useInterval(initializeClient, CLIENT_INIT_RETRY_INTERVAL, shouldStopTryingToInitializeClient)

  return initializeClient
}
