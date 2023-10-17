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

import { DefaultTheme, NavigationContainer, NavigationProp, useNavigation } from '@react-navigation/native'
import { NavigationState } from '@react-navigation/routers'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import { isEnrolledAsync } from 'expo-local-authentication'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Alert, AppState, AppStateStatus } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Host } from 'react-native-portalize'
import { useTheme } from 'styled-components/native'

import ProgressHeader from '~/components/headers/ProgressHeader'
import AnalyticsProvider from '~/contexts/AnalyticsContext'
import { NavigationScrollContextProvider } from '~/contexts/NavigationScrollContext'
import { WalletConnectContextProvider } from '~/contexts/walletConnect/WalletConnectContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import BackupMnemonicNavigation from '~/navigation/BackupMnemonicNavigation'
import InWalletTabsNavigation from '~/navigation/InWalletNavigation'
import ReceiveNavigation from '~/navigation/ReceiveNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import SendNavigation from '~/navigation/SendNavigation'
import { loadBiometricsSettings, storeBiometricsSettings } from '~/persistent-storage/settings'
import {
  deriveWalletStoredAddresses,
  disableBiometrics,
  getStoredWallet,
  getWalletMetadata
} from '~/persistent-storage/wallet'
import AddressDiscoveryScreen from '~/screens/AddressDiscoveryScreen'
import EditAddressScreen from '~/screens/Addresses/Address/EditAddressScreen'
import NewAddressScreen from '~/screens/Addresses/Address/NewAddressScreen'
import ContactScreen from '~/screens/Addresses/Contact/ContactScreen'
import EditContactScreen from '~/screens/Addresses/Contact/EditContactScreen'
import NewContactScreen from '~/screens/Addresses/Contact/NewContactScreen'
import CustomNetworkScreen from '~/screens/CustomNetworkScreen'
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
import { appBecameInactive } from '~/store/appSlice'
import { biometricsToggled } from '~/store/settingsSlice'
import { walletUnlocked } from '~/store/wallet/walletSlice'
import { isNavStateRestorable, rootStackNavigationRef } from '~/utils/navigation'
import { resetNavigationState, setNavigationState } from '~/utils/navigation'

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
          <AppUnlockHandler>
            <NavigationScrollContextProvider>
              <AnalyticsProvider>
                <WalletConnectContextProvider>
                  <RootStack.Navigator initialRouteName="SplashScreen">
                    {/* Sub-navigation with custom header */}
                    <RootStack.Group screenOptions={{ headerTransparent: true }}>
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
                        name="LandingScreen"
                        component={LandingScreen}
                        options={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter }}
                      />
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
                      <RootStack.Screen name="PinCodeCreationScreen" component={PinCodeCreationScreen} />
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
                      <RootStack.Screen name="CustomNetworkScreen" component={CustomNetworkScreen} />
                      <RootStack.Screen
                        name="ImportWalletAddressDiscoveryScreen"
                        component={ImportWalletAddressDiscoveryScreen}
                      />
                    </RootStack.Group>
                  </RootStack.Navigator>
                </WalletConnectContextProvider>
              </AnalyticsProvider>
            </NavigationScrollContextProvider>
          </AppUnlockHandler>
        </NavigationContainer>
      </Host>
    </GestureHandlerRootView>
  )
}

export default RootStackNavigation

const AppUnlockHandler = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch()
  const appState = useRef(AppState.currentState)
  const lastNavigationState = useAppSelector((s) => s.app.lastNavigationState)
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const walletMnemonic = useAppSelector((s) => s.wallet.mnemonic)
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const [isAppStateChangeCallbackRegistered, setIsAppStateChangeCallbackRegistered] = useState(false)

  const unlockApp = useCallback(async () => {
    if (walletMnemonic) return

    try {
      const deviceHasBiometricsData = await isEnrolledAsync()
      const walletMetadata = await getWalletMetadata()
      let isBioEnabled = await loadBiometricsSettings()

      // Disable biometrics if needed
      if (isBioEnabled && !deviceHasBiometricsData) {
        await disableBiometrics()
        await storeBiometricsSettings(false)
        dispatch(biometricsToggled(false))
        isBioEnabled = false
      }

      const wallet = await getStoredWallet()

      if (!wallet) {
        if (lastNavigationState) {
          setNavigationState(lastNavigationState)
        } else {
          navigation.navigate('LandingScreen')
        }
      } else {
        if (isBioEnabled) {
          const addressesToInitialize =
            addressesStatus === 'uninitialized' ? await deriveWalletStoredAddresses(wallet) : []
          dispatch(walletUnlocked({ wallet, addressesToInitialize, contacts: walletMetadata?.contacts ?? [] }))

          lastNavigationState ? setNavigationState(lastNavigationState) : resetNavigationState()
        } else {
          navigation.navigate('LoginWithPinScreen')
        }
      }

      // TODO: Revisit error handling with proper error codes
    } catch (e: unknown) {
      const error = e as { message?: string }

      if (error.message?.includes('User canceled')) {
        Alert.alert('Authentication required', 'Please authenticate to unlock your wallet.', [
          { text: 'Try again', onPress: unlockApp }
        ])
      } else {
        console.error(e)
      }
    }
  }, [addressesStatus, dispatch, lastNavigationState, navigation, walletMnemonic])

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' && walletMnemonic && !isCameraOpen) {
        navigation.navigate('SplashScreen')
        dispatch(appBecameInactive())
      } else if (nextAppState === 'active' && !walletMnemonic && !isCameraOpen) {
        unlockApp()
      }

      appState.current = nextAppState
    }

    if (!isAppStateChangeCallbackRegistered && appState.current === 'active') {
      handleAppStateChange('active')
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    setIsAppStateChangeCallbackRegistered(true)

    return subscription.remove
  }, [dispatch, isAppStateChangeCallbackRegistered, isCameraOpen, navigation, unlockApp, walletMnemonic])

  return children
}
