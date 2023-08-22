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

import '@walletconnect/react-native-compat'

import SignClient from '@walletconnect/sign-client'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

interface WalletConnectContextValue {
  walletConnectClient?: SignClient
}

const initialValues: WalletConnectContextValue = {
  walletConnectClient: undefined
}

const WalletConnectContext = createContext(initialValues)

export const WalletConnectContextProvider = ({ children }: { children: ReactNode }) => {
  const [walletConnectClient, setWalletConnectClient] = useState<WalletConnectContextValue['walletConnectClient']>()

  const initializeWalletConnectClient = useCallback(async () => {
    try {
      const client = await SignClient.init({
        projectId: '6e2562e43678dd68a9070a62b6d52207',
        relayUrl: 'wss://relay.walletconnect.com',
        metadata: {
          name: 'Alephium mobile wallet',
          description: 'Alephium mobile wallet',
          url: 'https://github.com/alephium/mobile-wallet',
          icons: ['https://alephium.org/favicon-32x32.png']
        }
      })

      setWalletConnectClient(client)
    } catch (e) {
      console.error('Could not initialize WalletConnect client', e)
    }
  }, [])

  useEffect(() => {
    if (!walletConnectClient) initializeWalletConnectClient()
  }, [initializeWalletConnectClient, walletConnectClient])

  return <WalletConnectContext.Provider value={{ walletConnectClient }}>{children}</WalletConnectContext.Provider>
}

export const useWalletConnectContext = () => useContext(WalletConnectContext)
