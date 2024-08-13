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

import Ionicons from '@expo/vector-icons/Ionicons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StatusBar } from 'expo-status-bar'
import { useTranslation } from 'react-i18next'
import { Host } from 'react-native-portalize'
import { useTheme } from 'styled-components'

import FooterMenu from '~/components/footers/FooterMenu'
import AddressesTabNavigation from '~/navigation/AddressesTabNavigation'
import ActivityScreen from '~/screens/ActivityScreen'
import DashboardScreen from '~/screens/Dashboard/DashboardScreen'
import NFTsScreen from '~/screens/NFTs/NFTsScreen'

export type InWalletTabsParamList = {
  DashboardScreen: undefined
  NFTsScreen: undefined
  AddressesTabNavigation: undefined
  ActivityScreen: undefined
}

const InWalletTabs = createBottomTabNavigator<InWalletTabsParamList>()

const InWalletTabsNavigation = () => {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <Host>
      <StatusBar style={theme.name === 'light' ? 'dark' : 'light'} />
      <InWalletTabs.Navigator
        tabBar={(props) => <FooterMenu {...props} />}
        screenOptions={{
          headerShown: false
        }}
      >
        <InWalletTabs.Screen
          name="DashboardScreen"
          component={DashboardScreen}
          options={{
            title: t('Overview'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} size={size} />
            )
          }}
        />
        <InWalletTabs.Screen
          name="NFTsScreen"
          component={NFTsScreen}
          options={{
            title: t('NFTs'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'image' : 'image-outline'} color={color} size={size} />
            )
          }}
        />
        <InWalletTabs.Screen
          name="ActivityScreen"
          component={ActivityScreen}
          options={{
            title: t('Activity'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'list' : 'list-outline'} color={color} size={size} />
            )
          }}
        />
        <InWalletTabs.Screen
          name="AddressesTabNavigation"
          component={AddressesTabNavigation}
          options={{
            title: t('Addresses'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} color={color} size={size} />
            )
          }}
        />
      </InWalletTabs.Navigator>
    </Host>
  )
}

export default InWalletTabsNavigation
