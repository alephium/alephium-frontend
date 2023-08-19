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
import { Album as AddressesIcon, ArrowLeftRight as ArrowsIcon, List as ListIcon } from 'lucide-react-native'
import { useTheme } from 'styled-components/native'

import DashboardHeaderActions from '~/components/DashboardHeaderActions'
import FooterMenu from '~/components/footers/FooterMenu'
import DefaultHeader from '~/components/headers/DefaultHeader'
import TopTabBar from '~/components/TopTabBar'
import WalletSwitch from '~/components/WalletSwitch'
import { ScrollContextProvider } from '~/contexts/ScrollContext'
import AddressesTabNavigation from '~/navigation/AddressesTabNavigation'
import InWalletTabsParamList from '~/navigation/inWalletRoutes'
import DashboardScreen from '~/screens/DashboardScreen'
import TransfersScreen from '~/screens/TransfersScreen'

const InWalletTabs = createBottomTabNavigator<InWalletTabsParamList>()

const InWalletTabsNavigation = () => {
  const theme = useTheme()

  return (
    <ScrollContextProvider>
      <InWalletTabs.Navigator
        screenOptions={{
          headerStyle: [{ elevation: 0, shadowOpacity: 0 }],
          headerTitle: ''
        }}
        tabBar={(props) => <FooterMenu {...props} />}
      >
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
              <DefaultHeader
                HeaderRight={<DashboardHeaderActions />}
                HeaderLeft={<WalletSwitch />}
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
            header: (props) => <DefaultHeader HeaderLeft="Transfers" {...props} />
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
            header: (props) => <TopTabBar {...props} />
          }}
        />
      </InWalletTabs.Navigator>
    </ScrollContextProvider>
  )
}

export default InWalletTabsNavigation
