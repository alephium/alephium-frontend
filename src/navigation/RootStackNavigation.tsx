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
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Host } from 'react-native-portalize'
import { useTheme } from 'styled-components/native'

import NavigationStackHeader from '~/components/headers/NavigationStackHeader'
import ProgressHeader from '~/components/headers/ProgressHeader'
import AnalyticsProvider from '~/contexts/AnalyticsContext'
import { NavigationScrollContextProvider } from '~/contexts/NavigationScrollContext'
import { WalletConnectContextProvider } from '~/contexts/walletConnect/WalletConnectContext'
import { useAppDispatch } from '~/hooks/redux'
import BackupMnemonicNavigation from '~/navigation/BackupMnemonicNavigation'
import InWalletTabsNavigation from '~/navigation/InWalletNavigation'
import ReceiveNavigation from '~/navigation/ReceiveNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import SendNavigation from '~/navigation/SendNavigation'
import AddressDiscoveryScreen from '~/screens/AddressDiscoveryScreen'
import EditAddressScreen from '~/screens/Addresses/Address/EditAddressScreen'
import NewAddressScreen from '~/screens/Addresses/Address/NewAddressScreen'
import ContactScreen from '~/screens/Addresses/Contact/ContactScreen'
import EditContactScreen from '~/screens/Addresses/Contact/EditContactScreen'
import NewContactScreen from '~/screens/Addresses/Contact/NewContactScreen'
import LandingScreen from '~/screens/LandingScreen'
import LoginWithPinScreen from '~/screens/LoginWithPinScreen'
import AddBiometricsScreen from '~/screens/new-wallet/AddBiometricsScreen'
import DecryptScannedMnemonicScreen from '~/screens/new-wallet/DecryptScannedMnemonicScreen'
import ImportWalletAddressDiscoveryScreen from '~/screens/new-wallet/ImportWalletAddressDiscoveryScreen'
import ImportWalletSeedScreen from '~/screens/new-wallet/ImportWalletSeedScreen'
import NewWalletIntroScreen from '~/screens/new-wallet/NewWalletIntroScreen'
import NewWalletNameScreen from '~/screens/new-wallet/NewWalletNameScreen'
import NewWalletSuccessScreen from '~/screens/new-wallet/NewWalletSuccessScreen'
import PinCodeCreationScreen from '~/screens/new-wallet/PinCodeCreationScreen'
import SelectImportMethodScreen from '~/screens/new-wallet/SelectImportMethodScreen'
import EditWalletNameScreen from '~/screens/Settings/EditWalletName'
import SettingsScreen from '~/screens/Settings/SettingsScreen'
import SplashScreen from '~/screens/SplashScreen'
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
          <NavigationScrollContextProvider>
            <AnalyticsProvider>
              <WalletConnectContextProvider>
                <RootStack.Navigator initialRouteName="SplashScreen">
                  {/* Screens with default header */}
                  <RootStack.Group
                    screenOptions={{ header: (props) => <NavigationStackHeader {...props} />, headerTransparent: true }}
                  >
                    <RootStack.Screen
                      name="LandingScreen"
                      component={LandingScreen}
                      options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter }}
                    />
                    <RootStack.Screen name="PinCodeCreationScreen" component={PinCodeCreationScreen} />
                  </RootStack.Group>
                  <RootStack.Group screenOptions={{ headerTransparent: true }}>
                    {/* Sub-navigation with custom header */}
                    <RootStack.Screen
                      name="SendNavigation"
                      component={SendNavigation}
                      options={{
                        header: (props) => (
                          <ProgressHeader
                            workflow="send"
                            {...props}
                            options={{ ...props.options, headerTitle: 'Send' }}
                          />
                        )
                      }}
                    />
                    <RootStack.Screen
                      name="ReceiveNavigation"
                      component={ReceiveNavigation}
                      options={{
                        header: (props) => (
                          <ProgressHeader
                            workflow="receive"
                            {...props}
                            options={{ ...props.options, headerTitle: 'Receive' }}
                          />
                        )
                      }}
                    />
                    <RootStack.Screen
                      name="BackupMnemonicNavigation"
                      component={BackupMnemonicNavigation}
                      options={{
                        header: (props) => (
                          <ProgressHeader
                            workflow="backup"
                            {...props}
                            options={{ ...props.options, headerTitle: 'Backup' }}
                          />
                        )
                      }}
                    />
                  </RootStack.Group>
                  {/* Screens without header */}
                  <RootStack.Group screenOptions={{ headerShown: false }}>
                    <RootStack.Screen
                      name="SplashScreen"
                      component={SplashScreen}
                      options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter }}
                    />
                    <RootStack.Screen
                      name="LoginWithPinScreen"
                      component={LoginWithPinScreen}
                      options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter }}
                    />
                    <RootStack.Screen name="NewWalletSuccessScreen" component={NewWalletSuccessScreen} />
                    <RootStack.Screen
                      name="InWalletTabsNavigation"
                      component={InWalletTabsNavigation}
                      options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter }}
                    />
                    <RootStack.Screen name="SettingsScreen" component={SettingsScreen} />
                    <RootStack.Screen name="NewContactScreen" component={NewContactScreen} />
                    <RootStack.Screen name="ContactScreen" component={ContactScreen} />
                    <RootStack.Screen name="NewAddressScreen" component={NewAddressScreen} />
                    <RootStack.Screen name="EditContactScreen" component={EditContactScreen} />
                    <RootStack.Screen name="EditAddressScreen" component={EditAddressScreen} />
                    <RootStack.Screen name="AddressDiscoveryScreen" component={AddressDiscoveryScreen} />
                    <RootStack.Screen name="NewWalletNameScreen" component={NewWalletNameScreen} />
                    <RootStack.Screen name="NewWalletIntroScreen" component={NewWalletIntroScreen} />
                    <RootStack.Screen name="SelectImportMethodScreen" component={SelectImportMethodScreen} />
                    <RootStack.Screen name="DecryptScannedMnemonicScreen" component={DecryptScannedMnemonicScreen} />
                    <RootStack.Screen name="ImportWalletSeedScreen" component={ImportWalletSeedScreen} />
                    <RootStack.Screen name="AddBiometricsScreen" component={AddBiometricsScreen} />
                    <RootStack.Screen name="EditWalletNameScreen" component={EditWalletNameScreen} />
                    <RootStack.Screen
                      name="ImportWalletAddressDiscoveryScreen"
                      component={ImportWalletAddressDiscoveryScreen}
                    />
                  </RootStack.Group>
                </RootStack.Navigator>
              </WalletConnectContextProvider>
            </AnalyticsProvider>
          </NavigationScrollContextProvider>
        </NavigationContainer>
      </Host>
    </GestureHandlerRootView>
  )
}

export default RootStackNavigation
