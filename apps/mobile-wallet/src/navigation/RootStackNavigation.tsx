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

import { DefaultTheme, NavigationContainer, NavigationProp, useNavigation } from '@react-navigation/native'
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Pressable } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { Host } from 'react-native-portalize'
import { useTheme } from 'styled-components/native'

import { Analytics, sendAnalytics } from '~/analytics'
import ToastAnchor from '~/components/toasts/ToastAnchor'
import { WalletConnectContextProvider } from '~/contexts/walletConnect/WalletConnectContext'
import useAutoLock from '~/features/auto-lock/useAutoLock'
import FundPasswordScreen from '~/features/fund-password/FundPasswordScreen'
import { deleteFundPassword } from '~/features/fund-password/fundPasswordStorage'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import BackupMnemonicNavigation from '~/navigation/BackupMnemonicNavigation'
import InWalletTabsNavigation from '~/navigation/InWalletNavigation'
import ReceiveNavigation from '~/navigation/ReceiveNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import SendNavigation from '~/navigation/SendNavigation'
import { appInstallationTimestampMissing, rememberAppInstallation, wasAppUninstalled } from '~/persistent-storage/app'
import { loadBiometricsSettings } from '~/persistent-storage/settings'
import {
  deleteDeprecatedWallet,
  getDeprecatedStoredWallet,
  getStoredWalletMetadata,
  getWalletMetadata,
  isStoredWalletMetadataMigrated,
  migrateDeprecatedMnemonic,
  storedMnemonicV2Exists
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
import SelectImportMethodScreen from '~/screens/new-wallet/SelectImportMethodScreen'
import PublicKeysScreen from '~/screens/PublicKeysScreen'
import EditWalletNameScreen from '~/screens/Settings/EditWalletName'
import SettingsScreen from '~/screens/Settings/SettingsScreen'
import { mnemonicMigrated, walletUnlocked } from '~/store/wallet/walletActions'
import { showExceptionToast, showToast } from '~/utils/layout'
import { resetNavigation, rootStackNavigationRef } from '~/utils/navigation'

const RootStack = createStackNavigator<RootStackParamList>()

interface RootStackNavigationProps {
  initialRouteName?: keyof RootStackParamList
}

const RootStackNavigation = ({ initialRouteName }: RootStackNavigationProps) => {
  const theme = useTheme()

  const themeNavigator = {
    ...DefaultTheme,
    dark: theme.name === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: theme.font.primary,
      background: theme.bg.back1,
      card: theme.bg.primary,
      text: theme.font.primary,
      border: theme.border.primary
    }
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Host>
        <NavigationContainer ref={rootStackNavigationRef} theme={themeNavigator}>
          <Analytics>
            <WalletConnectContextProvider>
              <RootStack.Navigator
                initialRouteName={initialRouteName || 'LandingScreen'}
                screenOptions={{ headerShown: false }}
              >
                <RootStack.Group screenOptions={{ cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter }}>
                  <RootStack.Screen name="LandingScreen" component={LandingScreen} />
                  <RootStack.Screen name="LoginWithPinScreen" component={LoginWithPinScreen} />
                  <RootStack.Screen name="NewWalletSuccessScreen" component={NewWalletSuccessScreen} />
                  <RootStack.Screen name="InWalletTabsNavigation" component={InWalletTabsNavigation} />
                </RootStack.Group>
                <RootStack.Screen name="SendNavigation" component={SendNavigation} />
                <RootStack.Screen name="ReceiveNavigation" component={ReceiveNavigation} />
                <RootStack.Screen name="BackupMnemonicNavigation" component={BackupMnemonicNavigation} />
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
                <RootStack.Screen name="PublicKeysScreen" component={PublicKeysScreen} />
                <RootStack.Screen name="FundPasswordScreen" component={FundPasswordScreen} />
                <RootStack.Screen
                  name="ImportWalletAddressDiscoveryScreen"
                  component={ImportWalletAddressDiscoveryScreen}
                />
              </RootStack.Navigator>
            </WalletConnectContextProvider>
          </Analytics>
          <AppUnlockModal initialRouteName={initialRouteName || 'InWalletTabsNavigation'} />
        </NavigationContainer>
      </Host>
    </GestureHandlerRootView>
  )
}

export default RootStackNavigation

const AppUnlockModal = ({ initialRouteName }: Required<RootStackNavigationProps>) => {
  const dispatch = useAppDispatch()
  const isWalletUnlocked = useAppSelector((s) => s.wallet.isUnlocked)
  const lastUsedWalletId = useAppSelector((s) => s.wallet.id)
  const biometricsRequiredForAppAccess = useAppSelector((s) => s.settings.usesBiometrics)
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
  const { t } = useTranslation()

  const initializeAppWithStoredWallet = useCallback(async () => {
    const metadata = await getStoredWalletMetadata()

    // Note: metadata should have already been migrated in validateAndRepareStoredWalletData if mnemonic V2 exists or
    // migrateDeprecatedMnemonic if it doesn't
    if (!isStoredWalletMetadataMigrated(metadata)) {
      const message = 'Could not unlock wallet because metadata is not migrated'
      sendAnalytics({ type: 'error', message })
      throw new Error(message)
    }

    try {
      dispatch(walletUnlocked(metadata))

      const lastRoute = rootStackNavigationRef.current?.getCurrentRoute()?.name

      if (!lastRoute || ['LandingScreen', 'LoginWithPinScreen'].includes(lastRoute)) {
        resetNavigation(navigation, initialRouteName)
      }
    } catch (error) {
      const message = 'Could not initialize app with stored wallet'
      showExceptionToast(error, message)
      sendAnalytics({ type: 'error', error, message })
    }
  }, [dispatch, initialRouteName, navigation])

  const unlockApp = useCallback(async () => {
    if (isWalletUnlocked) return

    try {
      const mnemonicV2Exists = await storedMnemonicV2Exists()
      const deprecatedWallet = await getDeprecatedStoredWallet({ authenticationPrompt: t('Unlock your wallet') })

      if (mnemonicV2Exists) {
        try {
          await triggerBiometricsAuthGuard({
            settingsToCheck: 'appAccess',
            successCallback: initializeAppWithStoredWallet,
            failureCallback: (message: string) =>
              showToast({ type: 'error', text1: 'Biometrics authentication failed', text2: message })
          })

          if (deprecatedWallet) {
            try {
              await deleteDeprecatedWallet()
            } catch (error) {
              const message = 'Could not delete deprecated wallet'
              showExceptionToast(error, message)
              sendAnalytics({ type: 'error', message })
            }
          }
        } catch (error) {
          const message = 'Could not authenticate'
          showExceptionToast(error, message)
          console.error(message)
        }
      } else if (deprecatedWallet) {
        if ((await loadBiometricsSettings()).biometricsRequiredForAppAccess) {
          try {
            await migrateDeprecatedMnemonic(deprecatedWallet.mnemonic)

            dispatch(mnemonicMigrated())
            sendAnalytics({ event: 'Mnemonic migrated' })

            initializeAppWithStoredWallet()
          } catch {
            sendAnalytics({
              type: 'error',
              message: `Could not migrate deprecated mnemonic of length ${deprecatedWallet.mnemonic.split(' ').length}`
            })

            navigation.navigate('LoginWithPinScreen')
          }
        } else {
          navigation.navigate('LoginWithPinScreen')
        }
      }

      try {
        const metadataExist = !!(await getWalletMetadata())

        if ((await appInstallationTimestampMissing()) || (!metadataExist && !mnemonicV2Exists && !deprecatedWallet)) {
          if (await wasAppUninstalled()) {
            try {
              await deleteFundPassword()
            } catch {
              sendAnalytics({ type: 'error', message: 'Could not delete fund password' })
            }
          }

          await rememberAppInstallation()
        }
      } catch (error) {
        sendAnalytics({ type: 'error', message: 'Could not remember app install timestamp' })
      }
    } catch (e: unknown) {
      const error = e as { message?: string }

      if (error.message?.includes('User canceled')) {
        showToast({ text1: t('Authentication required'), text2: t('Exit the app and try again.'), type: 'error' })
      } else {
        console.error(e)
        showExceptionToast(e, t('Could not unlock app'))
      }
    }
  }, [dispatch, initializeAppWithStoredWallet, isWalletUnlocked, navigation, t, triggerBiometricsAuthGuard])

  useAutoLock(unlockApp)

  return (
    <Modal visible={!!lastUsedWalletId && biometricsRequiredForAppAccess && !isWalletUnlocked} animationType="none">
      <Pressable
        onPress={unlockApp}
        style={{ backgroundColor: 'black', flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <AlephiumLogo style={{ width: '25%' }} />
      </Pressable>
      <ToastAnchor />
    </Modal>
  )
}
