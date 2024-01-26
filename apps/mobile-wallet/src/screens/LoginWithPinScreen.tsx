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

import { StackScreenProps } from '@react-navigation/stack'
import * as SplashScreen from 'expo-splash-screen'
import { useCallback, useState } from 'react'

import { sendAnalytics } from '~/analytics'
import AuthenticationModal from '~/components/AuthenticationModal'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import { Spinner } from '~/components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { storeBiometricsSettings } from '~/persistent-storage/settings'
import {
  deriveWalletStoredAddresses,
  didBiometricsSettingsChange,
  disableBiometrics,
  enableBiometrics,
  getWalletMetadata
} from '~/persistent-storage/wallet'
import { biometricsToggled } from '~/store/settingsSlice'
import { walletUnlocked } from '~/store/wallet/walletSlice'
import { WalletState } from '~/types/wallet'
import { showToast } from '~/utils/layout'
import { resetNavigation, restoreNavigation } from '~/utils/navigation'

interface LoginWithPinScreenProps extends StackScreenProps<RootStackParamList, 'LoginWithPinScreen'>, ScreenProps {}

const LoginWithPinScreen = ({ navigation, ...props }: LoginWithPinScreenProps) => {
  const dispatch = useAppDispatch()
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const lastNavigationState = useAppSelector((s) => s.app.lastNavigationState)

  const [isPinModalVisible, setIsPinModalVisible] = useState(true)

  const handleSuccessfulLogin = useCallback(
    async (pin?: string, wallet?: WalletState) => {
      if (!pin || !wallet) return

      setIsPinModalVisible(false)

      if (await didBiometricsSettingsChange()) {
        try {
          await enableBiometrics(wallet.mnemonic, 'Detected biometrics change, please re-activate')
          await storeBiometricsSettings(true)
          dispatch(biometricsToggled(true))
        } catch (e: unknown) {
          await disableBiometrics()
          await storeBiometricsSettings(false)
          dispatch(biometricsToggled(false))

          showToast({
            text1: 'Biometrics deactivated',
            text2: 'You can reactivate them in the settings'
          })
        }
      }

      const addressesToInitialize = addressesStatus === 'uninitialized' ? await deriveWalletStoredAddresses(wallet) : []
      const metadata = await getWalletMetadata()

      dispatch(walletUnlocked({ wallet, addressesToInitialize, pin, contacts: metadata?.contacts ?? [] }))
      lastNavigationState ? restoreNavigation(navigation, lastNavigationState) : resetNavigation(navigation)

      sendAnalytics('Unlocked wallet')
    },
    [addressesStatus, dispatch, lastNavigationState, navigation]
  )

  return (
    <Screen contrastedBg {...props}>
      <AuthenticationModal
        visible={isPinModalVisible}
        forcePinUsage
        onConfirm={handleSuccessfulLogin}
        onLayout={() => SplashScreen.hideAsync()}
      />
      {!isPinModalVisible && <Spinner text="Unlocking..." />}
    </Screen>
  )
}

export default LoginWithPinScreen
