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
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Host } from 'react-native-portalize'
import { useTheme } from 'styled-components'

import StackHeader from '~/components/headers/StackHeader'
import AnalyticsProvider from '~/contexts/AnalyticsContext'
import { ScrollContextProvider } from '~/contexts/ScrollContext'
import { useAppDispatch } from '~/hooks/redux'
import InWalletTabsNavigation from '~/navigation/InWalletNavigation'
import ReceiveNavigation from '~/navigation/ReceiveNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import SendNavigation from '~/navigation/SendNavigation'
import NewAddressScreen from '~/screens/Address/NewAddressScreen'
import AddressDiscoveryScreen from '~/screens/AddressDiscoveryScreen'
import ContactScreen from '~/screens/Addresses/Contact/ContactScreen'
import EditContactScreen from '~/screens/Addresses/Contact/EditContactScreen'
import NewContactScreen from '~/screens/Addresses/Contact/NewContactScreen'
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
import ProgressHeader from '~/screens/SendReceive/ProgressHeader'
import SettingsScreen from '~/screens/SettingsScreen'
import SplashScreen from '~/screens/SplashScreen'
import SwitchWalletScreen from '~/screens/SwitchWalletScreen'
import { routeChanged } from '~/store/appSlice'
import { isNavStateRestorable, rootStackNavigationRef } from '~/utils/navigation'

const RootStack = createStackNavigator<RootStackParamList>()

const RootStackNavigation = () => {
  const theme = useTheme()
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Host>
        <NavigationContainer ref={rootStackNavigationRef} onStateChange={handleStateChange} theme={themeNavigator}>
          <ScrollContextProvider>
            <AnalyticsProvider>
              <RootStack.Navigator initialRouteName="SplashScreen">
                {/* Screens with default header */}
                <RootStack.Group
                  screenOptions={{
                    header: (props) => <StackHeader {...props} />,
                    headerTransparent: true
                  }}
                >
                  <RootStack.Screen name="LandingScreen" component={LandingScreen} />
                  <RootStack.Screen name="NewWalletIntroScreen" component={NewWalletIntroScreen} />
                  <RootStack.Screen name="NewWalletNameScreen" component={NewWalletNameScreen} />
                  <RootStack.Screen name="PinCodeCreationScreen" component={PinCodeCreationScreen} />
                  <RootStack.Screen name="AddBiometricsScreen" component={AddBiometricsScreen} />
                  <RootStack.Screen
                    name="SettingsScreen"
                    component={SettingsScreen}
                    options={{
                      headerTitle: 'Settings'
                    }}
                  />
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
                  <RootStack.Screen
                    name="NewAddressScreen"
                    component={NewAddressScreen}
                    options={{ headerTitle: 'New address' }}
                  />
                  <RootStack.Screen
                    name="ReceiveNavigation"
                    component={ReceiveNavigation}
                    options={{
                      header: (props) => <ProgressHeader workflow="receive" {...props} />
                    }}
                  />
                  <RootStack.Screen name="ContactScreen" component={ContactScreen} />
                </RootStack.Group>
                <RootStack.Group screenOptions={{ headerShown: false }}>
                  {/* Sub-navigation with custom header */}
                  <RootStack.Screen name="SendNavigation" component={SendNavigation} />
                </RootStack.Group>
                {/* Screens without header */}
                <RootStack.Group screenOptions={{ headerShown: false }}>
                  <RootStack.Screen name="SplashScreen" component={SplashScreen} />
                  <RootStack.Screen name="LoginScreen" component={LoginScreen} />
                  <RootStack.Screen name="NewWalletSuccessScreen" component={NewWalletSuccessScreen} />
                  <RootStack.Screen name="InWalletTabsNavigation" component={InWalletTabsNavigation} />
                  <RootStack.Screen name="SwitchWalletScreen" component={SwitchWalletScreen} />
                </RootStack.Group>
              </RootStack.Navigator>
            </AnalyticsProvider>
          </ScrollContextProvider>
        </NavigationContainer>
      </Host>
    </GestureHandlerRootView>
  )
}

export default RootStackNavigation
