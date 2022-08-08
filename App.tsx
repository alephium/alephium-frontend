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

import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components/native'

import { useAppDispatch, useAppSelector } from './src/hooks/redux'
import useInitializeClient from './src/hooks/useInitializeClient'
import useLoadStoredAddressesMetadata from './src/hooks/useLoadStoredAddressesMetadata'
import useLoadStoredSettings from './src/hooks/useLoadStoredSettings'
import RootStackNavigation, { navigate } from './src/navigation/RootStackNavigation'
import { walletFlushed } from './src/store/activeWalletSlice'
import { pinFlushed } from './src/store/credentialsSlice'
import { store } from './src/store/store'
import { lightTheme } from './src/style/themes'
import { FC } from './src/types/misc'

const App = () => (
  <Provider store={store}>
    <Main>
      <ThemeProvider theme={lightTheme}>
        <RootStackNavigation />
        <StatusBar style="auto" />
      </ThemeProvider>
    </Main>
  </Provider>
)

const Main: FC<unknown> = ({ children }) => {
  const dispatch = useAppDispatch()
  const appState = useRef(AppState.currentState)
  const activeWallet = useAppSelector((state) => state.activeWallet)

  useInitializeClient()
  useLoadStoredSettings()
  useLoadStoredAddressesMetadata()

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        dispatch(pinFlushed())
        dispatch(walletFlushed())
      } else if (nextAppState === 'active' && !activeWallet.mnemonic) {
        navigate('SplashScreen')
      }

      appState.current = nextAppState
      console.log('AppState:', appState.current)
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      subscription.remove()
    }
  }, [activeWallet.mnemonic, dispatch])

  return <>{children}</>
}

export default App
