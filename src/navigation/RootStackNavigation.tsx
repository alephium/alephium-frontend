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

import { ScrollContextProvider } from '~/contexts/ScrollContext'
import useBottomModalOptions from '~/hooks/layout/useBottomModalOptions'
import { useAppDispatch } from '~/hooks/redux'
import InWalletTabsNavigation from '~/navigation/InWalletNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import SendNavigation from '~/navigation/SendNavigation'
import AddressDiscoveryScreen from '~/screens/AddressDiscovery'
import EditAddressScreen from '~/screens/EditAddressScreen'
import LandingScreen from '~/screens/LandingScreen'
import LoginScreen from '~/screens/LoginScreen'
import AddBiometricsScreen from '~/screens/new-wallet/AddBiometricsScreen'
import ImportWalletAddressDiscoveryScreen from '~/screens/new-wallet/ImportWalletAddressDiscoveryScreen'
import ImportWalletSeedScreen from '~/screens/new-wallet/ImportWalletSeedScreen'
import NewWalletIntroScreen from '~/screens/new-wallet/NewWalletIntroScreen'
import NewWalletNameScreen from '~/screens/new-wallet/NewWalletNameScreen'
import NewWalletSuccessPage from '~/screens/new-wallet/NewWalletSuccessPage'
import PinCodeCreationScreen from '~/screens/new-wallet/PinCodeCreationScreen'
import NewAddressScreen from '~/screens/NewAddressScreen'
import ReceiveScreen from '~/screens/ReceiveScreen'
import SecurityScreen from '~/screens/SecurityScreen'
import SendScreenHeader from '~/screens/Send/SendScreenHeader'
import SettingsScreen from '~/screens/SettingsScreen'
import SplashScreen from '~/screens/SplashScreen'
import SwitchNetworkScreen from '~/screens/SwitchNetworkScreen'
import SwitchWalletAfterDeletionScreen from '~/screens/SwitchWalletAfterDeletionScreen'
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
      <ScrollContextProvider>
        <RootStack.Navigator
          initialRouteName="SplashScreen"
          screenOptions={{
            headerStyle: { elevation: 0, shadowOpacity: 0 },
            headerTitle: '',
            headerBackTitleVisible: false,
            cardStyle: {
              backgroundColor: theme.bg.primary
            }
          }}
        >
          <RootStack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
          <RootStack.Screen name="LandingScreen" component={LandingScreen} options={{ headerShown: false }} />
          <RootStack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />

          {/* NEW WALLET */}
          <RootStack.Screen name="NewWalletIntroScreen" component={NewWalletIntroScreen} />
          <RootStack.Screen name="NewWalletNameScreen" component={NewWalletNameScreen} />
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
          <RootStack.Screen name="PinCodeCreationScreen" component={PinCodeCreationScreen} />
          <RootStack.Screen name="AddBiometricsScreen" component={AddBiometricsScreen} />
          <RootStack.Screen
            name="NewWalletSuccessPage"
            component={NewWalletSuccessPage}
            options={{ headerShown: false }}
          />

          <RootStack.Screen name="InWalletScreen" component={InWalletTabsNavigation} options={{ headerShown: false }} />

          <RootStack.Screen name="SwitchWalletScreen" component={SwitchWalletScreen} options={bottomModalOptions} />

          <RootStack.Screen
            name="NewAddressScreen"
            component={NewAddressScreen}
            options={{ headerTitle: 'New address' }}
          />
          <RootStack.Screen name="EditAddressScreen" component={EditAddressScreen} options={bottomModalOptions} />

          <RootStack.Screen name="SettingsScreen" component={SettingsScreen} options={{ headerTitle: 'Settings' }} />
          <RootStack.Screen
            name="SecurityScreen"
            component={SecurityScreen}
            options={{ headerTitle: 'Security', cardStyle: { backgroundColor: theme.global.pale } }}
          />
          <RootStack.Screen name="SwitchNetworkScreen" component={SwitchNetworkScreen} options={bottomModalOptions} />
          <RootStack.Screen
            name="SwitchWalletAfterDeletionScreen"
            component={SwitchWalletAfterDeletionScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen name="TransactionScreen" component={TransactionScreen} options={bottomModalOptions} />
          <RootStack.Screen name="ReceiveScreen" component={ReceiveScreen} options={bottomModalOptions} />
          <RootStack.Screen
            name="AddressDiscoveryScreen"
            component={AddressDiscoveryScreen}
            options={{ headerTitle: 'Active addresses' }}
          />

          <RootStack.Screen
            name="SendNavigation"
            component={SendNavigation}
            options={{ ...bottomModalOptions, header: (props) => <SendScreenHeader {...props} /> }}
          />
        </RootStack.Navigator>
      </ScrollContextProvider>
    </NavigationContainer>
  )
}

export default RootStackNavigation
