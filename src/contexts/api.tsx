/*
Copyright 2018 - 2022 The Alephium Authors
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

import { createContext, FC, useCallback, useContext, useEffect, useRef, useState } from 'react'

import Client from '../api/client'
import { NetworkType } from '../types/settings'
import { getNetworkName } from '../utils/settings'
import { useGlobalContext } from './global'

export interface ApiContextProps {
  client?: Client
  setClient: (client: Client) => void
  isClientLoading: boolean
  network: NetworkType
  isOffline: boolean
}

const defaults = {
  client: undefined,
  setClient: () => null,
  isClientLoading: false,
  network: NetworkType.mainnet,
  isOffline: false
}

export const ApiContext = createContext<ApiContextProps>(defaults)

export const ApiContextProvider: FC = ({ children }) => {
  const [client, setClient] = useState<Client>()
  const [isClientLoading, setIsClientLoading] = useState(defaults.isClientLoading)
  const [isOffline, setIsOffline] = useState(defaults.isOffline)
  const previousNodeHost = useRef<string>()
  const previousExplorerAPIHost = useRef<string>()
  const { settings } = useGlobalContext()
  const network = getNetworkName(settings.network)

  const createClient = useCallback(async () => {
    setIsClientLoading(true)

    const newClient = new Client(settings.network)
    await newClient.init()
    setClient(newClient)

    if (!settings.network.nodeHost || !settings.network.explorerApiHost) {
      setIsOffline(true)
    } else {
      console.log(`Client initialized. Current network: ${network}`)
      if (isOffline) setIsOffline(false)
    }

    setIsClientLoading(false)
  }, [isOffline, network, settings.network])

  useEffect(() => {
    const networkSettingsHaveChanged =
      previousNodeHost.current !== settings.network.nodeHost ||
      previousExplorerAPIHost.current !== settings.network.explorerApiHost

    if (networkSettingsHaveChanged) {
      createClient()
      previousNodeHost.current = settings.network.nodeHost
      previousExplorerAPIHost.current = settings.network.explorerApiHost
    }
  }, [createClient, settings.network.explorerApiHost, settings.network.nodeHost])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isOffline) {
      interval = setInterval(createClient, 2000)
    }
    return () => clearInterval(interval)
  })

  return (
    <ApiContext.Provider
      value={{
        client,
        setClient,
        isClientLoading,
        network,
        isOffline
      }}
    >
      {children}
    </ApiContext.Provider>
  )
}

export const useApiContext = () => useContext(ApiContext)
