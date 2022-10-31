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

import { createNavigationContainerRef, DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { NavigationState } from '@react-navigation/routers'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'
import { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import { useTheme } from 'styled-components'

import useBottomModalOptions from '../hooks/layout/useBottomModalOptions'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import AddressScreen from '../screens/AddressScreen'
import EditAddressScreen from '../screens/EditAddressScreen'
import LandingScreen from '../screens/LandingScreen'
import LoginScreen from '../screens/LoginScreen'
import AddBiometricsScreen from '../screens/new-wallet/AddBiometricsScreen'
import ImportWalletSeedScreen from '../screens/new-wallet/ImportWalletSeedScreen'
import NewWalletIntroScreen from '../screens/new-wallet/NewWalletIntroScreen'
import NewWalletNameScreen from '../screens/new-wallet/NewWalletNameScreen'
import NewWalletSuccessPage from '../screens/new-wallet/NewWalletSuccessPage'
import PinCodeCreationScreen from '../screens/new-wallet/PinCodeCreationScreen'
import NewAddressScreen from '../screens/NewAddressScreen'
import ReceiveScreen from '../screens/ReceiveScreen'
import SecurityScreen from '../screens/SecurityScreen'
import SendScreen from '../screens/SendScreen'
import SettingsScreen from '../screens/SettingsScreen'
import SplashScreen from '../screens/SplashScreen'
import SwitchNetworkScreen from '../screens/SwitchNetworkScreen'
import SwitchWalletAfterDeletionScreen from '../screens/SwitchWalletAfterDeletionScreen'
import SwitchWalletScreen from '../screens/SwitchWalletScreen'
import TransactionScreen from '../screens/TransactionScreen'
import { routeChanged } from '../store/appMetadataSlice'
import InWalletTabsNavigation from './InWalletNavigation'
import RootStackParamList from './rootStackRoutes'

const rootStackNavigationRef = createNavigationContainerRef<RootStackParamList>()
const RootStack = createStackNavigator<RootStackParamList>()

const RootStackNavigation = () => {
  const theme = useTheme()
  const bottomModalOptions = useBottomModalOptions()
  const { height: screenHeight } = useWindowDimensions()
  const smallBottomModalOptions = useBottomModalOptions({ height: screenHeight - 460 })
  const dispatch = useAppDispatch()
  const lastNavigationState = useAppSelector((state) => state.appMetadata.lastNavigationState)
  const isAuthenticated = !!useAppSelector((state) => state.activeWallet.mnemonic)

  const handleStateChange = (state?: NavigationState) => {
    if (state && isAuthenticated) dispatch(routeChanged(state))
  }

  const themeNavigator = {
    ...DefaultTheme,
    dark: theme.name === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: theme.font.primary,
      background: theme.bg.primary,
      card: theme.bg.secondary,
      text: theme.font.primary,
      border: theme.border.primary
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      rootStackNavigationRef.resetRoot(lastNavigationState ?? { index: 0, routes: [{ name: 'InWalletScreen' }] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  return (
    <NavigationContainer ref={rootStackNavigationRef} onStateChange={handleStateChange} theme={themeNavigator}>
      <RootStack.Navigator
        initialRouteName={'SplashScreen'}
        screenOptions={{
          headerStyle: { elevation: 0, shadowOpacity: 0, backgroundColor: 'transparent' },
          cardStyle: { backgroundColor: theme.bg.secondary },
          headerTitle: ''
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
        <RootStack.Screen name="PinCodeCreationScreen" component={PinCodeCreationScreen} />
        <RootStack.Screen name="AddBiometricsScreen" component={AddBiometricsScreen} />
        <RootStack.Screen name="NewWalletSuccessPage" component={NewWalletSuccessPage} />

        <RootStack.Screen name="InWalletScreen" component={InWalletTabsNavigation} options={{ headerShown: false }} />

        <RootStack.Screen name="SwitchWalletScreen" component={SwitchWalletScreen} options={smallBottomModalOptions} />
        <RootStack.Screen name="AddressScreen" component={AddressScreen} />

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
        <RootStack.Screen name="SendScreen" component={SendScreen} options={bottomModalOptions} />
      </RootStack.Navigator>
    </NavigationContainer>
  )
}

// Navigating without the navigation prop:
// https://reactnavigation.org/docs/navigating-without-navigation-prop
export const navigateRootStack = (
  name: keyof RootStackParamList,
  params?: StackScreenProps<RootStackParamList>['route']['params']
) => {
  if (rootStackNavigationRef.isReady()) {
    rootStackNavigationRef.navigate(name, params)
  }
}

export default RootStackNavigation
