import {
  batchers,
  explorerApiClientInitFailed,
  explorerApiClientInitSucceeded,
  nodeApiClientInitFailed,
  nodeApiClientInitSucceeded,
  throttledClient
} from '@alephium/shared'
import { useCallback, useEffect } from 'react'

import { useSharedDispatch, useSharedSelector } from '@/redux'
import { useInterval } from '@/useInterval'

const CLIENT_INIT_RETRY_INTERVAL = 2000

export const useInitializeThrottledClient = () => {
  const network = useSharedSelector((s) => s.network)
  const dispatch = useSharedDispatch()

  const initializeClient = useCallback(async () => {
    try {
      throttledClient.init(network.settings.nodeHost, network.settings.explorerApiHost)
      batchers.init()

      if (network.nodeStatus !== 'online') {
        try {
          const { networkId } = await throttledClient.node.infos.getInfosChainParams()
          dispatch(nodeApiClientInitSucceeded({ networkId, networkName: network.name }))
        } catch (e) {
          console.error(e)
          dispatch(nodeApiClientInitFailed({ networkName: network.name }))
        }
      }

      if (network.explorerStatus !== 'online') {
        try {
          await throttledClient.explorer.infos.getInfos()
          dispatch(explorerApiClientInitSucceeded())
        } catch (e) {
          console.error(e)
          dispatch(explorerApiClientInitFailed())
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, [
    network.nodeStatus,
    network.explorerStatus,
    network.settings.nodeHost,
    network.settings.explorerApiHost,
    network.name,
    dispatch
  ])

  useEffect(() => {
    if (network.nodeStatus === 'connecting' || network.explorerStatus === 'connecting') {
      initializeClient()
    }
  }, [initializeClient, network.nodeStatus, network.explorerStatus])

  const shouldRetryToInitializeClient = network.nodeStatus === 'offline' || network.explorerStatus === 'offline'

  useInterval(initializeClient, CLIENT_INIT_RETRY_INTERVAL, !shouldRetryToInitializeClient)

  return initializeClient
}
