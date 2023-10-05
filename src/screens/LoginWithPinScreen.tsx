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

import { StackScreenProps } from '@react-navigation/stack'
import { usePostHog } from 'posthog-react-native'
import { useCallback, useState } from 'react'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import AuthenticationModal from '~/components/AuthenticationModal'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { deriveWalletStoredAddresses, getWalletMetadata } from '~/persistent-storage/wallet'
import { walletUnlocked } from '~/store/wallet/walletSlice'
import { WalletState } from '~/types/wallet'
import { resetNavigationState, setNavigationState } from '~/utils/navigation'

interface LoginWithPinScreenProps extends StackScreenProps<RootStackParamList, 'LoginWithPinScreen'>, ScreenProps {}

const LoginWithPinScreen = (props: LoginWithPinScreenProps) => {
  const dispatch = useAppDispatch()
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const lastNavigationState = useAppSelector((s) => s.app.lastNavigationState)
  const posthog = usePostHog()

  const [isPinModalVisible, setIsPinModalVisible] = useState(true)

  const handleSuccessfulLogin = useCallback(
    async (pin?: string, wallet?: WalletState) => {
      if (!pin || !wallet) return

      setIsPinModalVisible(false)

      const addressesToInitialize = addressesStatus === 'uninitialized' ? await deriveWalletStoredAddresses(wallet) : []
      const { contacts } = await getWalletMetadata()

      dispatch(walletUnlocked({ wallet, addressesToInitialize, pin, contacts }))
      lastNavigationState ? setNavigationState(lastNavigationState) : resetNavigationState()

      posthog?.capture('Unlocked wallet')
    },
    [addressesStatus, dispatch, lastNavigationState, posthog]
  )

  return (
    <Screen contrastedBg {...props}>
      <AuthenticationModal visible={isPinModalVisible} forcePinUsage onConfirm={handleSuccessfulLogin} />
      {!isPinModalVisible && (
        <Message>
          <AppText>Nice 👍 Unlocking...</AppText>
        </Message>
      )}
    </Screen>
  )
}

export default LoginWithPinScreen

const Message = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`
