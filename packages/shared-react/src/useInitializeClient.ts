/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { apiClientInitFailed, apiClientInitSucceeded, client } from '@alephium/shared'
import { useCallback, useEffect } from 'react'

import { useSharedDispatch, useSharedSelector } from '@/redux'
import { useInterval } from '@/useInterval'

const CLIENT_INIT_RETRY_INTERVAL = 2000

export const useInitializeClient = () => {
  const network = useSharedSelector((s) => s.network)
  const dispatch = useSharedDispatch()

  const shouldStopTryingToInitializeClient = network.status !== 'offline'

  const initializeClient = useCallback(async () => {
    try {
      client.init(network.settings.nodeHost, network.settings.explorerApiHost)
      const { networkId } = await client.node.infos.getInfosChainParams()
      // TODO: Check if connection to explorer also works
      dispatch(apiClientInitSucceeded({ networkId, networkName: network.name }))
    } catch (e) {
      dispatch(apiClientInitFailed({ networkName: network.name, networkStatus: network.status }))
    }
  }, [network.settings.nodeHost, network.settings.explorerApiHost, network.name, network.status, dispatch])

  useEffect(() => {
    if (network.status === 'connecting') {
      initializeClient()
    }
  }, [initializeClient, network.status])

  useInterval(initializeClient, CLIENT_INIT_RETRY_INTERVAL, shouldStopTryingToInitializeClient)

  return initializeClient
}
