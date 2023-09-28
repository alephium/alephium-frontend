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

import { getHumanReadableError, walletOpenAsyncUnsafe } from '@alephium/sdk'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { usePostHog } from 'posthog-react-native'
import { useState } from 'react'
import { Alert } from 'react-native'

import AppText from '~/components/AppText'
import BoxSurface from '~/components/layout/BoxSurface'
import { ScreenSection } from '~/components/layout/Screen'
import RadioButtonRow from '~/components/RadioButtonRow'
import SpinnerModal from '~/components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useSortedWallets } from '~/hooks/useSortedWallets'
import RootStackParamList from '~/navigation/rootStackRoutes'
import {
  deriveWalletStoredAddresses,
  getActiveWalletMetadata,
  getEncryptedWallets,
  getWalletMetadataById,
  rememberActiveWallet
} from '~/persistent-storage/wallets'
import { walletSwitched } from '~/store/activeWalletSlice'
import { loadedDecryptedWallets } from '~/store/wallet/walletActions'
import { SimpleWallet } from '~/types/wallet'
import { mnemonicToSeed, pbkdf2 } from '~/utils/crypto'
import { resetNavigationState } from '~/utils/navigation'

interface SwitchWalletListProps {
  onClose?: () => void
}

const SwitchWalletList = ({ onClose }: SwitchWalletListProps) => {
  const dispatch = useAppDispatch()
  const sortedWallets = useSortedWallets()
  const activeWalletMetadataId = useAppSelector((s) => s.activeWallet.id)
  const isBiometricsEnabled = useAppSelector((s) => s.settings.usesBiometrics)
  const pin = useAppSelector((s) => s.credentials.pin)
  const posthog = usePostHog()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const wallets = useAppSelector((s) => s.wallets.entities)
  const walletIds = useAppSelector((s) => s.wallets.ids)

  const [loading, setLoading] = useState(false)

  const handleWalletItemPress = async (walletId: string) => {
    setLoading(true)
    onClose && onClose()

    try {
      if (walletIds.length === 0) {
        if (pin) {
          const encryptedWallets = await getEncryptedWallets()
          const decryptedWallets: SimpleWallet[] = []

          for (const { id, mnemonic } of encryptedWallets) {
            const decryptedWallet = await walletOpenAsyncUnsafe(pin, mnemonic, pbkdf2, mnemonicToSeed)

            decryptedWallets.push({ id, mnemonic: decryptedWallet.mnemonic })
          }

          dispatch(loadedDecryptedWallets(decryptedWallets))
        } else {
          navigation.navigate('LoginScreen', { walletIdToLogin: walletId, workflow: 'wallet-switch' })
          return
        }
      }

      const storedWallet = {
        ...(wallets[walletId] as SimpleWallet),
        ...(await getWalletMetadataById(walletId))
      }
      let mnemonic = storedWallet.mnemonic

      if (!isBiometricsEnabled) {
        if (pin) {
          const decryptedWallet = await walletOpenAsyncUnsafe(pin, mnemonic, pbkdf2, mnemonicToSeed)
          mnemonic = decryptedWallet.mnemonic
        } else {
          navigation.navigate('LoginScreen', { walletIdToLogin: walletId, workflow: 'wallet-switch' })
          return
        }
      }

      const wallet = { ...storedWallet, mnemonic }
      await rememberActiveWallet(wallet.id)
      const addressesToInitialize = await deriveWalletStoredAddresses(wallet)
      const activeWalletMetadata = await getActiveWalletMetadata()

      dispatch(walletSwitched({ wallet, addressesToInitialize, contacts: activeWalletMetadata?.contacts ?? [] }))
      resetNavigationState()

      posthog?.capture('Switched wallet')
    } catch (e) {
      Alert.alert(getHumanReadableError(e, 'Could not switch wallets'))

      posthog?.capture('Error', { message: 'Could not switch wallets' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ScreenSection>
        <AppText semiBold size={16} color="secondary">
          Select a wallet to switch to.
        </AppText>
      </ScreenSection>
      <ScreenSection>
        <BoxSurface>
          {sortedWallets.map((wallet) => (
            <RadioButtonRow
              key={wallet.id}
              title={wallet.name}
              onPress={() => handleWalletItemPress(wallet.id)}
              isActive={wallet.id === activeWalletMetadataId}
              isInput
            />
          ))}
        </BoxSurface>
      </ScreenSection>

      <SpinnerModal isActive={loading} text="Switching wallets..." />
    </>
  )
}

export default SwitchWalletList
