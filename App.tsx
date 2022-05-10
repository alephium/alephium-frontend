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
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styled-components/native'

import { AddressesContextProvider } from './src/contexts/addresses'
import { ApiContextProvider } from './src/contexts/api'
import { GlobalContextProvider } from './src/contexts/global'
import RootStackNavigation from './src/navigation/RootStackNavigation'
import { store } from './src/store/store'
import { lightTheme } from './src/style/themes'

const App = () => (
  <Provider store={store}>
    <GlobalContextProvider>
      <ApiContextProvider>
        <AddressesContextProvider>
          <ThemeProvider theme={lightTheme}>
            <RootStackNavigation />
            <StatusBar style="auto" />
          </ThemeProvider>
        </AddressesContextProvider>
      </ApiContextProvider>
    </GlobalContextProvider>
  </Provider>
)

export default App
