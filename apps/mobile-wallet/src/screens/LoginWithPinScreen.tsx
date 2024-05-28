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
import DeprecatedAuthenticationModal from '~/components/DeprecatedAuthenticationModal'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import { Spinner } from '~/components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometrics } from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { getStoredWallet, migrateDeprecatedMnemonic } from '~/persistent-storage/wallet'
import { allBiometricsEnabled } from '~/store/settings/settingsActions'
import { mnemonicMigrated, walletUnlocked } from '~/store/wallet/walletActions'
import { showExceptionToast } from '~/utils/layout'
import { resetNavigation } from '~/utils/navigation'

interface LoginWithPinScreenProps extends StackScreenProps<RootStackParamList, 'LoginWithPinScreen'>, ScreenProps {}

const LoginWithPinScreen = ({ navigation, ...props }: LoginWithPinScreenProps) => {
  const dispatch = useAppDispatch()
  const biometricsRequiredForAppAccess = useAppSelector((s) => s.settings.usesBiometrics)
  const { deviceSupportsBiometrics, deviceHasEnrolledBiometrics } = useBiometrics()

  const [isPinModalVisible, setIsPinModalVisible] = useState(true)

  const handleSuccessfulLogin = useCallback(
    async (deprecatedMnemonic?: string) => {
      if (!deprecatedMnemonic) return

      setIsPinModalVisible(false)

      try {
        await migrateDeprecatedMnemonic(deprecatedMnemonic)
        dispatch(mnemonicMigrated())

        if (deviceSupportsBiometrics && deviceHasEnrolledBiometrics && !biometricsRequiredForAppAccess) {
          dispatch(allBiometricsEnabled())
        }

        const wallet = await getStoredWallet()

        dispatch(walletUnlocked(wallet))
        resetNavigation(navigation)
        sendAnalytics({ event: 'Unlocked wallet' })
        SplashScreen.hideAsync()
      } catch (error) {
        const message = 'Could not migrate mnemonic and unlock wallet'

        showExceptionToast(error, message)
        sendAnalytics({ type: 'error', message })
      }
    },
    [biometricsRequiredForAppAccess, deviceHasEnrolledBiometrics, deviceSupportsBiometrics, dispatch, navigation]
  )

  return (
    <Screen contrastedBg {...props}>
      <DeprecatedAuthenticationModal
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
