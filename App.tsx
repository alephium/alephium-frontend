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
import { ReactNode, useEffect, useState } from 'react'
import { RootSiblingParent } from 'react-native-root-siblings'
import { Provider } from 'react-redux'
import { DefaultTheme, ThemeProvider } from 'styled-components/native'

import { useAppStateChange } from './src/hooks/useAppStateChange'
import useInitializeClient from './src/hooks/useInitializeClient'
import useLoadStoredAddressesMetadata from './src/hooks/useLoadStoredAddressesMetadata'
import useLoadStoredSettings from './src/hooks/useLoadStoredSettings'
import useRefreshALPHPrice from './src/hooks/useRefreshALPHPrice'
import RootStackNavigation from './src/navigation/RootStackNavigation'
import { store } from './src/store/store'
import { themes } from './src/style/themes'

const App = () => {
  const [theme, setTheme] = useState<DefaultTheme>(themes.light)

  useEffect(() => {
    return store.subscribe(() => {
      setTheme(themes[store.getState().settings.theme])
    })
  }, [store])

  return (
    <RootSiblingParent>
      <Provider store={store}>
        <Main>
          <ThemeProvider theme={theme}>
            <RootStackNavigation />
            <StatusBar style="dark" />
          </ThemeProvider>
        </Main>
      </Provider>
    </RootSiblingParent>
  )
}

const Main = ({ children }: { children: ReactNode }) => {
  useInitializeClient()
  useLoadStoredSettings()
  useLoadStoredAddressesMetadata()
  useAppStateChange()
  useRefreshALPHPrice()

  return <>{children}</>
}

export default App
