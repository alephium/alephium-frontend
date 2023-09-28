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

import { decryptAsync } from '@alephium/sdk'
import { StackScreenProps } from '@react-navigation/stack'
import { usePostHog } from 'posthog-react-native'
import { useRef, useState } from 'react'

import { ContinueButton } from '~/components/buttons/Button'
import ConfirmWithAuthModal from '~/components/ConfirmWithAuthModal'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import ScreenIntro from '~/components/layout/ScreenIntro'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import useBiometrics from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { importContacts } from '~/persistent-storage/contacts'
import { enableBiometrics, generateAndStoreWallet } from '~/persistent-storage/wallets'
import { importAddresses } from '~/store/addresses/addressesStorageUtils'
import { biometricsToggled } from '~/store/settingsSlice'
import { newWalletImportedWithMetadata } from '~/store/wallet/walletActions'
import { WalletImportData } from '~/types/wallet'
import { pbkdf2 } from '~/utils/crypto'

interface DecryptScannedMnemonicScreenProps
  extends StackScreenProps<RootStackParamList, 'DecryptScannedMnemonicScreen'>,
    ScrollScreenProps {}

const DecryptScannedMnemonicScreen = ({ navigation, ...props }: DecryptScannedMnemonicScreenProps) => {
  const qrCodeImportedEncryptedMnemonic = useAppSelector((s) => s.walletGeneration.qrCodeImportedEncryptedMnemonic)
  const name = useAppSelector((s) => s.walletGeneration.walletName)
  const credentials = useAppSelector((s) => s.credentials)
  const activeWalletMnemonic = useAppSelector((s) => s.activeWallet.mnemonic)
  const activeWalletAuthType = useAppSelector((s) => s.activeWallet.authType)
  const posthog = usePostHog()
  const dispatch = useAppDispatch()
  const lastActiveWalletAuthType = useRef(activeWalletAuthType)
  const deviceHasBiometricsData = useBiometrics()

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pin, setPin] = useState(credentials.pin)
  const [loading, setLoading] = useState(false)

  const isAuthenticated = !!activeWalletMnemonic

  const decryptAndImportWallet = async () => {
    if (!qrCodeImportedEncryptedMnemonic) return

    try {
      const decryptedData = await decryptAsync(password, qrCodeImportedEncryptedMnemonic, pbkdf2)
      const { mnemonic, addresses, contacts } = JSON.parse(decryptedData) as WalletImportData

      posthog?.capture('Decrypted desktop wallet QR code')

      if (!name || !pin) return

      setLoading(true)

      const wallet = await generateAndStoreWallet(name, pin, mnemonic)

      try {
        importAddresses(wallet.mnemonic, wallet.metadataId, addresses)
      } catch (e) {
        console.error(e)

        posthog?.capture('Error', { message: 'Could not import addresses from QR code scan' })
      }

      dispatch(newWalletImportedWithMetadata(wallet))

      posthog?.capture('Imported wallet', { note: 'Scanned desktop wallet QR code' })

      if (contacts.length > 0) importContacts(contacts)

      if (!isAuthenticated) {
        setLoading(false)
        navigation.navigate('AddBiometricsScreen', { skipAddressDiscovery: true })
        return
      }

      // We assume the preference of the user to enable biometrics by looking at the auth settings of the current wallet
      if (isAuthenticated && lastActiveWalletAuthType.current === 'biometrics' && deviceHasBiometricsData) {
        await enableBiometrics(wallet.metadataId, wallet.mnemonic)
        dispatch(biometricsToggled(true))
      }

      setLoading(false)

      navigation.navigate('NewWalletSuccessScreen')
      setPin('')
    } catch (e) {
      setError('Could not decrypt wallet with the given password.')
    }
  }

  const handleChangeText = (text: string) => {
    setPassword(text)
    setError('')
  }

  return (
    <ScrollScreen
      verticalGap
      usesKeyboard
      fill
      headerOptions={{
        headerTitle: 'Password',
        type: 'stack',
        headerRight: () => <ContinueButton onPress={decryptAndImportWallet} disabled={!password || !!error} />
      }}
    >
      <ScreenIntro subtitle="Enter your desktop wallet password to decrypt the secret recovery phrase." />
      <ScreenSection verticallyCentered fill>
        <Input
          label="Password"
          value={password}
          onChangeText={handleChangeText}
          secureTextEntry
          autoFocus
          error={error}
          style={{ width: '100%' }}
        />
      </ScreenSection>
      {!credentials.pin && <ConfirmWithAuthModal usePin onConfirm={setPin} />}
      {loading && <SpinnerModal isActive={loading} text="Importing wallet..." />}
    </ScrollScreen>
  )
}

export default DecryptScannedMnemonicScreen
