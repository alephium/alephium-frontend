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

import { walletOpenAsyncUnsafe } from '@alephium/sdk'
import { StackScreenProps } from '@react-navigation/stack'
import { usePostHog } from 'posthog-react-native'
import { useCallback, useState } from 'react'

import ConfirmWithAuthModal from '~/components/ConfirmWithAuthModal'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import {
  deriveWalletStoredAddresses,
  getActiveWalletMetadata,
  getEncryptedWallets,
  rememberActiveWallet
} from '~/persistent-storage/wallets'
import { walletSwitched, walletUnlocked } from '~/store/activeWalletSlice'
import { loadedDecryptedWallets } from '~/store/wallet/walletActions'
import { AddressPartial } from '~/types/addresses'
import { ActiveWalletState, SimpleWallet } from '~/types/wallet'
import { mnemonicToSeed, pbkdf2 } from '~/utils/crypto'
import { resetNavigationState, setNavigationState } from '~/utils/navigation'

interface LoginScreenProps extends StackScreenProps<RootStackParamList, 'LoginScreen'>, ScreenProps {}

const LoginScreen = ({
  route: {
    params: { walletIdToLogin, workflow }
  },
  ...props
}: LoginScreenProps) => {
  const dispatch = useAppDispatch()
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const lastNavigationState = useAppSelector((s) => s.app.lastNavigationState)
  const walletIds = useAppSelector((s) => s.wallets.ids)
  const posthog = usePostHog()

  const [isPinModalVisible, setIsPinModalVisible] = useState(true)

  const handleSuccessfulLogin = useCallback(
    async (pin?: string, wallet?: ActiveWalletState) => {
      if (!pin || !wallet) return

      if (walletIds.length === 0) {
        const encryptedWallets = (await getEncryptedWallets()).filter(({ id }) => id !== wallet.id)
        const decryptedWallets: SimpleWallet[] = [{ id: wallet.id, mnemonic: wallet.mnemonic }]

        for (const { id, mnemonic } of encryptedWallets) {
          const decryptedWallet = await walletOpenAsyncUnsafe(pin, mnemonic, pbkdf2, mnemonicToSeed)

          decryptedWallets.push({ id, mnemonic: decryptedWallet.mnemonic })
        }

        dispatch(loadedDecryptedWallets(decryptedWallets))
      }

      setIsPinModalVisible(false)
      let addressesToInitialize = [] as AddressPartial[]

      await rememberActiveWallet(wallet.id)

      const activeWalletMetadata = await getActiveWalletMetadata()
      const contacts = activeWalletMetadata?.contacts ?? []

      if (workflow === 'wallet-switch') {
        addressesToInitialize = await deriveWalletStoredAddresses(wallet)

        dispatch(walletSwitched({ wallet, addressesToInitialize, pin, contacts }))
        resetNavigationState()

        posthog?.capture('Switched wallet')
      } else if (workflow === 'wallet-unlock') {
        if (addressesStatus === 'uninitialized') {
          addressesToInitialize = await deriveWalletStoredAddresses(wallet)
        }

        dispatch(walletUnlocked({ wallet, addressesToInitialize, pin, contacts }))
        lastNavigationState ? setNavigationState(lastNavigationState) : resetNavigationState()

        posthog?.capture('Unlocked wallet')
      }
    },
    [addressesStatus, dispatch, lastNavigationState, posthog, walletIds.length, workflow]
  )

  return (
    <Screen {...props}>
      {isPinModalVisible && (
        <ConfirmWithAuthModal usePin onConfirm={handleSuccessfulLogin} walletId={walletIdToLogin} />
      )}
    </Screen>
  )
}

export default LoginScreen
