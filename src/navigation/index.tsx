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
import React from 'react'

import LandingScreen from '../screens/LandingScreen'
import NewWalletNameScreen from '../screens/new-wallet/NewWalletNameScreen'
import RootStackParamList from './rootStackRoutes'

const RootStack = createStackNavigator<RootStackParamList>()

const MainStackNavigation = () => (
  <NavigationContainer>
    <RootStack.Navigator>
      <RootStack.Screen name="LandingScreen" component={LandingScreen} options={{ headerShown: false }} />
      <RootStack.Screen name="NewWalletNameScreen" component={NewWalletNameScreen} options={{ headerShown: false }} />
    </RootStack.Navigator>
  </NavigationContainer>
)

export default MainStackNavigation
