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
import {
  ArrowLeftRight as ArrowsIcon,
  LayoutTemplate as LayoutTemplateIcon,
  List as ListIcon
} from 'lucide-react-native'
import { useSharedValue } from 'react-native-reanimated'

import DashboardHeaderActions from '../components/DashboardHeaderActions'
import FooterMenu from '../components/FooterMenu'
import DefaultHeader from '../components/headers/DefaultHeader'
import WalletSwitch from '../components/WalletSwitch'
import InWalletLayoutContext from '../contexts/InWalletLayoutContext'
import AddressesScreen from '../screens/AddressesScreen'
import DashboardScreen from '../screens/DashboardScreen'
import TransfersScreen from '../screens/TransfersScreen'
import InWalletTabsParamList from './inWalletRoutes'

const InWalletTabs = createBottomTabNavigator<InWalletTabsParamList>()

const InWalletTabsNavigation = () => {
  const scrollY = useSharedValue(0)

  return (
    <InWalletLayoutContext.Provider value={{ scrollY }}>
      <InWalletTabs.Navigator
        screenOptions={{
          headerStyle: [{ elevation: 0, shadowOpacity: 0 }],
          headerTitle: ''
        }}
        tabBar={(props) => <FooterMenu {...props} scrollY={scrollY} />}
      >
        <InWalletTabs.Screen
          name="DashboardScreen"
          component={DashboardScreen}
          options={{
            header: () => (
              <DefaultHeader HeaderRight={<DashboardHeaderActions />} HeaderLeft={<WalletSwitch />} scrollY={scrollY} />
            ),
            title: 'Overview',
            tabBarIcon: ({ color, size }) => <ListIcon name="home" color={color} size={size} />
          }}
        />
        <InWalletTabs.Screen
          name="AddressesScreen"
          component={AddressesScreen}
          options={{
            title: 'Addresses',
            headerTintColor: 'black',
            tabBarIcon: ({ color, size }) => <LayoutTemplateIcon name="home" color={color} size={size} />
          }}
        />
        <InWalletTabs.Screen
          name="TransfersScreen"
          component={TransfersScreen}
          options={{
            title: 'Transfers',
            tabBarIcon: ({ color, size }) => <ArrowsIcon name="home" color={color} size={size} />
          }}
        />
      </InWalletTabs.Navigator>
    </InWalletLayoutContext.Provider>
  )
}

export default InWalletTabsNavigation
