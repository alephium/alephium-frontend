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

import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { NavigationState } from '@react-navigation/routers'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from 'styled-components'

import AnalyticsProvider from '~/contexts/AnalyticsContext'
import useBottomModalOptions from '~/hooks/layout/useBottomModalOptions'
import { useAppDispatch } from '~/hooks/redux'
import InWalletTabsNavigation from '~/navigation/InWalletNavigation'
import NewAddressNavigation from '~/navigation/NewAddressNavigation'
import ReceiveNavigation from '~/navigation/ReceiveNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import SendNavigation from '~/navigation/SendNavigation'
import EditAddressScreen from '~/screens/Address/EditAddressScreen'
import AddressDiscoveryScreen from '~/screens/AddressDiscoveryScreen'
import AddressQuickNavigationScreen from '~/screens/Addresses/AddressQuickNavigationScreen'
import ContactScreen from '~/screens/Addresses/Contact/ContactScreen'
import EditContactScreen from '~/screens/Addresses/Contact/EditContactScreen'
import NewContactScreen from '~/screens/Addresses/Contact/NewContactScreen'
import CurrencySelectScreen from '~/screens/CurrencySelectScreen'
import LandingScreen from '~/screens/LandingScreen'
import LoginScreen from '~/screens/LoginScreen'
import AddBiometricsScreen from '~/screens/new-wallet/AddBiometricsScreen'
import ImportWalletAddressDiscoveryScreen from '~/screens/new-wallet/ImportWalletAddressDiscoveryScreen'
import ImportWalletSeedScreen from '~/screens/new-wallet/ImportWalletSeedScreen'
import NewWalletIntroScreen from '~/screens/new-wallet/NewWalletIntroScreen'
import NewWalletNameScreen from '~/screens/new-wallet/NewWalletNameScreen'
import NewWalletSuccessScreen from '~/screens/new-wallet/NewWalletSuccessScreen'
import PinCodeCreationScreen from '~/screens/new-wallet/PinCodeCreationScreen'
import SecurityScreen from '~/screens/SecurityScreen'
import ScreenHeader from '~/screens/SendReceive/ScreenHeader'
import SelectAddressScreen from '~/screens/SendReceive/Send/SelectAddressScreen'
import SelectContactScreen from '~/screens/SendReceive/Send/SelectContactScreen'
import SettingsScreen from '~/screens/SettingsScreen'
import SplashScreen from '~/screens/SplashScreen'
import SwitchNetworkScreen from '~/screens/SwitchNetworkScreen'
import SwitchWalletScreen from '~/screens/SwitchWalletScreen'
import TransactionScreen from '~/screens/TransactionScreen'
import { routeChanged } from '~/store/appSlice'
import { isNavStateRestorable, rootStackNavigationRef } from '~/utils/navigation'

const RootStack = createStackNavigator<RootStackParamList>()

const RootStackNavigation = () => {
  const theme = useTheme()
  const bottomModalOptions = useBottomModalOptions()
  const dispatch = useAppDispatch()

  const handleStateChange = (state?: NavigationState) => {
    if (state && isNavStateRestorable(state)) dispatch(routeChanged(state))
  }

  const themeNavigator = {
    ...DefaultTheme,
    dark: theme.name === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: theme.font.primary,
      background: theme.bg.primary,
      card: theme.bg.primary,
      text: theme.font.primary,
      border: theme.border.primary
    }
  }

  return (
    <NavigationContainer ref={rootStackNavigationRef} onStateChange={handleStateChange} theme={themeNavigator}>
      <AnalyticsProvider>
        <RootStack.Navigator
          initialRouteName="SplashScreen"
          screenOptions={{
            headerStyle: { elevation: 0, shadowOpacity: 0 },
            headerTitle: '',
            headerBackTitleVisible: false
          }}
        >
          {/* Screens with header */}
          <RootStack.Group>
            <RootStack.Screen name="LandingScreen" component={LandingScreen} />
            <RootStack.Screen name="NewWalletIntroScreen" component={NewWalletIntroScreen} />
            <RootStack.Screen name="NewWalletNameScreen" component={NewWalletNameScreen} />
            <RootStack.Screen name="PinCodeCreationScreen" component={PinCodeCreationScreen} />
            <RootStack.Screen name="AddBiometricsScreen" component={AddBiometricsScreen} />
            <RootStack.Screen name="ContactScreen" component={ContactScreen} />
            <RootStack.Screen name="SettingsScreen" component={SettingsScreen} options={{ headerTitle: 'Settings' }} />
            <RootStack.Screen
              name="ImportWalletSeedScreen"
              component={ImportWalletSeedScreen}
              options={{ headerTitle: 'Import wallet' }}
            />
            <RootStack.Screen
              name="ImportWalletAddressDiscoveryScreen"
              component={ImportWalletAddressDiscoveryScreen}
              options={{ headerTitle: 'Active addresses' }}
            />
            <RootStack.Screen
              name="SecurityScreen"
              component={SecurityScreen}
              options={{ headerTitle: 'Security', headerStyle: { backgroundColor: theme.global.pale } }}
            />
            <RootStack.Screen
              name="AddressDiscoveryScreen"
              component={AddressDiscoveryScreen}
              options={{ headerTitle: 'Active addresses' }}
            />
            <RootStack.Screen
              name="NewContactScreen"
              component={NewContactScreen}
              options={{ headerTitle: 'New contact' }}
            />
            <RootStack.Screen
              name="EditContactScreen"
              component={EditContactScreen}
              options={{ headerTitle: 'Edit contact' }}
            />
          </RootStack.Group>

          {/* Screens without header */}
          <RootStack.Group screenOptions={{ headerShown: false }}>
            <RootStack.Screen name="SplashScreen" component={SplashScreen} />
            <RootStack.Screen name="LoginScreen" component={LoginScreen} />
            <RootStack.Screen name="NewWalletSuccessScreen" component={NewWalletSuccessScreen} />
            <RootStack.Screen name="InWalletTabsNavigation" component={InWalletTabsNavigation} />
            <RootStack.Screen name="NewAddressNavigation" component={NewAddressNavigation} />
          </RootStack.Group>

          {/* Bottom modal screens */}
          <RootStack.Group screenOptions={bottomModalOptions}>
            <RootStack.Screen name="TransactionScreen" component={TransactionScreen} />
            <RootStack.Screen name="SwitchNetworkScreen" component={SwitchNetworkScreen} />
            <RootStack.Screen name="EditAddressScreen" component={EditAddressScreen} />
            <RootStack.Screen name="SwitchWalletScreen" component={SwitchWalletScreen} />
            <RootStack.Screen
              name="CurrencySelectScreen"
              component={CurrencySelectScreen}
              options={{ title: 'Currency' }}
            />
            <RootStack.Screen
              name="SendNavigation"
              component={SendNavigation}
              options={{ header: (props) => <ScreenHeader {...props} workflow="send" /> }}
            />
            <RootStack.Screen
              name="ReceiveNavigation"
              component={ReceiveNavigation}
              options={{ header: (props) => <ScreenHeader {...props} workflow="receive" /> }}
            />
            <RootStack.Screen name="AddressQuickNavigationScreen" component={AddressQuickNavigationScreen} />

            <RootStack.Screen
              name="SelectContactScreen"
              component={SelectContactScreen}
              initialParams={{ nextScreen: 'OriginScreen' }}
            />
            <RootStack.Screen
              name="SelectAddressScreen"
              component={SelectAddressScreen}
              initialParams={{ nextScreen: 'OriginScreen' }}
            />
          </RootStack.Group>
        </RootStack.Navigator>
      </AnalyticsProvider>
    </NavigationContainer>
  )
}

export default RootStackNavigation
