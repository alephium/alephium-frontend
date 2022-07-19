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

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'

import FooterMenu from '../components/FooterMenu'
import AddressesScreen from '../screens/AddressesScreen'
import DashboardScreen from '../screens/DashboardScreen'

const InWalletTabs = createBottomTabNavigator()

const InWalletTabsNavigation = () => {
  console.log('InWalletTabsNavigation renders')

  return (
    <InWalletTabs.Navigator
      screenOptions={{
        headerStyle: { elevation: 0, shadowOpacity: 0, backgroundColor: 'transparent' },
        headerTitle: ''
      }}
      tabBar={() => <FooterMenu />}
    >
      <InWalletTabs.Screen name="DashboardScreen" component={DashboardScreen} options={{ headerShown: false }} />
      <InWalletTabs.Screen name="AddressesScreen" component={AddressesScreen} />
    </InWalletTabs.Navigator>
  )
}

export default InWalletTabsNavigation
