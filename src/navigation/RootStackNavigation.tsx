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

import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import LandingScreen from '../screens/LandingScreen'
import AddBiometricsScreen from '../screens/new-wallet/AddBiometricsScreen'
import NewWalletIntroScreen from '../screens/new-wallet/NewWalletIntroScreen'
import NewWalletNameScreen from '../screens/new-wallet/NewWalletNameScreen'
import NewWalletSuccessPage from '../screens/new-wallet/NewWalletSuccessPage'
import PinCodeCreationScreen from '../screens/new-wallet/PinCodeCreationScreen'
import RootStackParamList from './rootStackRoutes'

const RootStack = createStackNavigator<RootStackParamList>()

const RootStackNavigation = () => (
  <NavigationContainer>
    <RootStack.Navigator
      screenOptions={{
        headerStyle: { elevation: 0, shadowOpacity: 0, backgroundColor: 'transparent' },
        cardStyle: { backgroundColor: '#fff' },
        headerTitle: ''
      }}
    >
      <RootStack.Screen name="LandingScreen" component={LandingScreen} options={{ headerShown: false }} />

      {/* NEW WALLET */}
      <RootStack.Screen name="NewWalletIntroScreen" component={NewWalletIntroScreen} />
      <RootStack.Screen name="NewWalletNameScreen" component={NewWalletNameScreen} />
      <RootStack.Screen name="PinCodeCreationScreen" component={PinCodeCreationScreen} />
      <RootStack.Screen name="AddBiometricsScreen" component={AddBiometricsScreen} />
      <RootStack.Screen name="NewWalletSuccessPage" component={NewWalletSuccessPage} />
    </RootStack.Navigator>
  </NavigationContainer>
)

export default RootStackNavigation
