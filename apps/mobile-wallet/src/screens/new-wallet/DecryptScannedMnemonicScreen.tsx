import { decryptAsync } from '@alephium/shared-crypto'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometrics } from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { importContacts } from '~/persistent-storage/contacts'
import { generateAndStoreWallet } from '~/persistent-storage/wallet'
import { importAddresses } from '~/store/addresses/addressesStorageUtils'
import { newWalletImportedWithMetadata } from '~/store/wallet/walletActions'
import { WalletImportData } from '~/types/wallet'
import { pbkdf2 } from '~/utils/crypto'
import { showExceptionToast } from '~/utils/layout'
import { resetNavigation } from '~/utils/navigation'

interface DecryptScannedMnemonicScreenProps
  extends StackScreenProps<RootStackParamList, 'DecryptScannedMnemonicScreen'>,
    ScrollScreenProps {}

const DecryptScannedMnemonicScreen = ({ navigation }: DecryptScannedMnemonicScreenProps) => {
  const qrCodeImportedEncryptedMnemonic = useAppSelector((s) => s.walletGeneration.qrCodeImportedEncryptedMnemonic)
  const biometricsRequiredForAppAccess = useAppSelector((s) => s.settings.usesBiometrics)
  const name = useAppSelector((s) => s.walletGeneration.walletName)
  const dispatch = useAppDispatch()
  const { deviceHasEnrolledBiometrics } = useBiometrics()
  const inputRef = useRef<TextInput>(null)
  const { t } = useTranslation()

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useFocusEffect(
    useCallback(() => {
      // Avoid weird iOS issue where input is focused then blurred right away
      inputRef.current?.focus()
    }, [])
  )

  const decryptAndImportWallet = async () => {
    // This should never happen, but if it does, let the user restart the process of creating a wallet
    if (!qrCodeImportedEncryptedMnemonic || !name) {
      Alert.alert(
        t('Could not proceed'),
        !qrCodeImportedEncryptedMnemonic ? 'Missing encrypted mnemonic' : 'Missing wallet name',
        [
          {
            text: t('Restart'),
            onPress: () => navigation.navigate('LandingScreen')
          }
        ]
      )
      return
    }

    try {
      setLoading(true)

      const decryptedData = await decryptAsync(password, qrCodeImportedEncryptedMnemonic, pbkdf2)
      const { mnemonic, addresses, contacts } = JSON.parse(decryptedData) as WalletImportData

      try {
        const wallet = await generateAndStoreWallet(name, mnemonic)

        dispatch(newWalletImportedWithMetadata(wallet))

        sendAnalytics({ event: 'Imported wallet', props: { note: 'Scanned desktop wallet QR code' } })

        try {
          await importAddresses(wallet.id, addresses)
        } catch (error) {
          const message = 'Could not import addresses from QR code scan'

          showExceptionToast(error, t(message))
          sendAnalytics({ type: 'error', message, isSensitive: true })
        }

        resetNavigation(
          navigation,
          deviceHasEnrolledBiometrics && !biometricsRequiredForAppAccess
            ? 'AddBiometricsScreen'
            : 'NewWalletSuccessScreen'
        )
      } catch (e) {
        const message = 'Could not import wallet from QR code scan'

        showExceptionToast(error, t(message))
        sendAnalytics({ type: 'error', message })
      }

      if (contacts.length > 0) await importContacts(contacts)
    } catch (e) {
      setError(t('Could not decrypt wallet with the given password.'))
    } finally {
      setLoading(false)
    }
  }

  const handleChangeText = (text: string) => {
    setPassword(text)
    setError('')
  }

  const handleBlur = () => {
    // And this as well is to avoid weird iOS issue where input is focused then blurred right away
    // WTF.
    inputRef.current?.focus()
  }

  return (
    <ScrollScreen
      verticalGap
      fill
      keyboardShouldPersistTaps="always"
      screenTitle={t('Password')}
      screenIntro={t('Enter your desktop wallet password to decrypt the secret recovery phrase.')}
      headerOptions={{ headerTitle: t('Password'), type: 'stack' }}
      bottomButtonsRender={() => (
        <Button
          title={t('Decrypt')}
          variant="highlight"
          onPress={decryptAndImportWallet}
          disabled={!password || !!error}
        />
      )}
      contentPaddingTop
    >
      <ScreenSection fill>
        <Input
          label={t('Password')}
          value={password}
          onChangeText={handleChangeText}
          secureTextEntry
          autoCapitalize="none"
          error={error}
          inputRef={inputRef}
          onBlur={handleBlur}
          blurOnSubmit={false}
          onSubmitEditing={decryptAndImportWallet}
        />
      </ScreenSection>
      {loading && <SpinnerModal isActive={loading} text={`${t('Importing wallet')}...`} />}
    </ScrollScreen>
  )
}

export default DecryptScannedMnemonicScreen
