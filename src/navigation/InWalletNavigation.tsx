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

import Ionicons from '@expo/vector-icons/Ionicons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import { Host } from 'react-native-portalize'
import { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import DashboardHeaderActions from '~/components/DashboardHeaderActions'
import FooterMenu from '~/components/footers/FooterMenu'
import BaseHeader from '~/components/headers/BaseHeader'
import TopTabBar from '~/components/TopTabBar'
import WalletSwitchButton from '~/components/WalletSwitchButton'
import { ScrollContextProvider } from '~/contexts/ScrollContext'
import { useAppSelector } from '~/hooks/redux'
import AddressesTabNavigation from '~/navigation/AddressesTabNavigation'
import InWalletTabsParamList from '~/navigation/inWalletRoutes'
import DashboardScreen from '~/screens/DashboardScreen'
import TransfersScreen from '~/screens/TransfersScreen'

const InWalletTabs = createBottomTabNavigator<InWalletTabsParamList>()

const InWalletTabsNavigation = () => {
  const theme = useTheme()
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)

  return (
    <ScrollContextProvider>
      <Host>
        <InWalletTabs.Navigator tabBar={(props) => <FooterMenu {...props} />}>
          <InWalletTabs.Screen
            name="DashboardScreen"
            component={DashboardScreen}
            options={{
              title: 'Overview',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} size={size} />
              ),
              headerTransparent: true,
              header: (props) => (
                <BaseHeader
                  HeaderRight={<DashboardHeaderActions />}
                  HeaderLeft={<WalletSwitchButton />}
                  headerTitle={activeWalletName}
                  HeaderCompactContent={<AppText>{activeWalletName}</AppText>}
                  bgColor={theme.bg.primary}
                  {...props}
                />
              )
            }}
          />
          <InWalletTabs.Screen
            name="TransfersScreen"
            component={TransfersScreen}
            options={{
              title: 'Transfers',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons name={focused ? 'receipt' : 'receipt-outline'} color={color} size={size} />
              ),
              header: (props) => (
                <BaseHeader
                  headerTitle="Transfers"
                  {...props}
                  HeaderCompactContent={<AppText>{'Transfers'}</AppText>}
                />
              ),
              headerTransparent: true
            }}
          />
          <InWalletTabs.Screen
            name="AddressesTabNavigation"
            component={AddressesTabNavigation}
            options={{
              title: 'Addresses',
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} color={color} size={size} />
              ),
              header: (props) => <BaseHeader HeaderLeft={<TopTabBar {...props} />} />,
              headerTransparent: true
            }}
          />
        </InWalletTabs.Navigator>
      </Host>
    </ScrollContextProvider>
  )
}

export default InWalletTabsNavigation
