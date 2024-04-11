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
import { getStoredWallet, migrateDeprecatedMnemonic } from '~/persistent-storage/wallet'
import { walletUnlocked } from '~/store/wallet/walletSlice'
import { showExceptionToast } from '~/utils/layout'
import { resetNavigation, restoreNavigation } from '~/utils/navigation'

interface LoginWithPinScreenProps extends StackScreenProps<RootStackParamList, 'LoginWithPinScreen'>, ScreenProps {}

const LoginWithPinScreen = ({ navigation, ...props }: LoginWithPinScreenProps) => {
  const dispatch = useAppDispatch()
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const isLoadingLatestTxs = useAppSelector((s) => s.loaders.loadingLatestTransactions)
  const lastNavigationState = useAppSelector((s) => s.app.lastNavigationState)

  const [isPinModalVisible, setIsPinModalVisible] = useState(true)

  const handleSuccessfulLogin = useCallback(
    async (deprecatedMnemonic?: string) => {
      if (!deprecatedMnemonic) return

      setIsPinModalVisible(false)

      try {
        await migrateDeprecatedMnemonic(deprecatedMnemonic)

        const needsAddressRegeneration = addressesStatus === 'uninitialized' && !isLoadingLatestTxs
        const { addressesToInitialize, contacts, ...wallet } = await getStoredWallet(needsAddressRegeneration)

        dispatch(walletUnlocked({ wallet, addressesToInitialize, contacts }))

        lastNavigationState ? restoreNavigation(navigation, lastNavigationState) : resetNavigation(navigation)

        sendAnalytics('Unlocked wallet')
      } catch (e) {
        console.error(e)
        showExceptionToast(e, 'Could not migrate mnemonic and unlock wallet')
      }
    },
    [addressesStatus, dispatch, isLoadingLatestTxs, lastNavigationState, navigation]
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
