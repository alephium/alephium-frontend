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

import { Wallet } from '@alephium/sdk'
import { createContext, FC, useContext, useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'

import { useAppDispatch, useAppSelector } from '../hooks/redux'
import useInitializeClient from '../hooks/useInitializeClient'
import useLoadStoredSettings from '../hooks/useLoadStoredSettings'
import { pinFlushed } from '../store/securitySlice'

export interface GlobalContextProps {
  wallet: Wallet | null
  setWallet: (wallet: Wallet | null) => void
}

export const defaults = {
  wallet: null,
  setWallet: () => null
}

export const GlobalContext = createContext<GlobalContextProps>(defaults)

export const GlobalContextProvider: FC = ({ children }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const appState = useRef(AppState.currentState)
  const dispatch = useAppDispatch()
  const pin = useAppSelector((state) => state.security.pin)

  useInitializeClient()
  useLoadStoredSettings()

  const lockWallet = () => setWallet(null)

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        dispatch(pinFlushed())
        lockWallet()
      }

      appState.current = nextAppState
      console.log('AppState:', appState.current)
    }

    AppState.addEventListener('change', handleAppStateChange)

    return () => {
      AppState.removeEventListener('change', handleAppStateChange)
    }
  }, [dispatch])

  useEffect(() => {
    if (!pin) {
      // TODO: Navigate to screen to ask for pin or biometrics
      console.log('Needs to navigate to screen to enter pin or biometrics')
    }
  }, [pin])

  return <GlobalContext.Provider value={{ wallet, setWallet }}>{children}</GlobalContext.Provider>
}

export const useGlobalContext = () => useContext(GlobalContext)
