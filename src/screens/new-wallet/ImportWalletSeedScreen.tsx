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
import { useHeaderHeight } from '@react-navigation/elements'
import { StackScreenProps } from '@react-navigation/stack'
import { colord } from 'colord'
import { ScanLine } from 'lucide-react-native'
import { usePostHog } from 'posthog-react-native'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native'
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ConfirmWithAuthModal from '~/components/ConfirmWithAuthModal'
import Input from '~/components/inputs/Input'
import Screen, { ScreenProps, ScreenSection, ScreenSectionTitle } from '~/components/layout/Screen'
import PasswordModal from '~/components/PasswordModal'
import QRCodeScannerModal from '~/components/QRCodeScannerModal'
import SpinnerModal from '~/components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import useBiometrics from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { importContacts } from '~/persistent-storage/contacts'
import { enableBiometrics, generateAndStoreWallet } from '~/persistent-storage/wallets'
import { biometricsEnabled } from '~/store/activeWalletSlice'
import { importAddresses } from '~/store/addresses/addressesStorageUtils'
import { syncAddressesData, syncAddressesHistoricBalances } from '~/store/addressesSlice'
import { cameraToggled } from '~/store/appSlice'
import { newWalletGenerated, newWalletImportedWithMetadata } from '~/store/wallet/walletActions'
import { BORDER_RADIUS, BORDER_RADIUS_SMALL } from '~/style/globalStyle'
import { WalletImportData } from '~/types/wallet'
import { bip39Words } from '~/utils/bip39'
import { pbkdf2 } from '~/utils/crypto'

interface ImportWalletSeedScreenProps
  extends StackScreenProps<RootStackParamList, 'ImportWalletSeedScreen'>,
    ScreenProps {}

type SelectedWord = {
  word: string
  timestamp: Date
}

// TODO: Set this to false before creating production build
const enablePasteForDevelopment = true

const ImportWalletSeedScreen = ({ navigation, ...props }: ImportWalletSeedScreenProps) => {
  const dispatch = useAppDispatch()
  const name = useAppSelector((s) => s.walletGeneration.walletName)
  const activeWalletMnemonic = useAppSelector((s) => s.activeWallet.mnemonic)
  const activeWalletAuthType = useAppSelector((s) => s.activeWallet.authType)
  const pin = useAppSelector((s) => s.credentials.pin)
  const isCameraOpen = useAppSelector((s) => s.app.isCameraOpen)
  const hasAvailableBiometrics = useBiometrics()
  const theme = useTheme()
  const allowedWords = useRef(bip39Words.split(' '))
  const lastActiveWalletAuthType = useRef(activeWalletAuthType)
  const posthog = usePostHog()

  const [typedInput, setTypedInput] = useState('')
  const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([])
  const [possibleMatches, setPossibleMatches] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [isPinModalVisible, setIsPinModalVisible] = useState(false)
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false)
  const [encryptedWalletFromQRCode, setEncryptedWalletFromQRCode] = useState('')
  const [decryptedWalletFromQRCode, setDecryptedWalletFromQRCode] = useState<WalletImportData>()

  const isAuthenticated = !!activeWalletMnemonic
  const openQRCodeScannerModal = () => dispatch(cameraToggled(true))
  const closeQRCodeScannerModal = () => dispatch(cameraToggled(false))

  const headerHeight = useHeaderHeight()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ScanButton onPress={openQRCodeScannerModal}>
          <ScanLine size={24} color={theme.global.accent} style={{ marginRight: 10 }} />
          <ScanText>Scan</ScanText>
        </ScanButton>
      )
    })
  })

  useEffect(() => {
    setPossibleMatches(
      typedInput.length <= 2
        ? []
        : allowedWords.current.filter((allowedWord) => allowedWord.startsWith(typedInput.toLowerCase().trim()))
    )
  }, [typedInput])

  const selectWord = (word: string) => {
    if (!word) return

    setSelectedWords(
      selectedWords.concat([
        {
          word,
          timestamp: new Date()
        }
      ])
    )
    setTypedInput('')
  }

  const removeSelectedWord = (word: SelectedWord) =>
    setSelectedWords(selectedWords.filter((selectedWord) => selectedWord.timestamp !== word.timestamp))

  const handleEnterPress = () => possibleMatches.length > 0 && selectWord(possibleMatches[0])

  const importWallet = useCallback(
    async (pin?: string, importedData?: WalletImportData) => {
      if (!name) return

      if (!pin) {
        setIsPinModalVisible(true)
        return
      }

      setLoading(true)

      const mnemonicToImport =
        importedData?.mnemonic ||
        (enablePasteForDevelopment ? typedInput : selectedWords.map(({ word }) => word).join(' '))

      const wallet = await generateAndStoreWallet(name, pin, mnemonicToImport)

      if (importedData?.addresses) {
        try {
          importAddresses(wallet.mnemonic, wallet.metadataId, importedData.addresses)
        } catch (e) {
          console.error(e)

          posthog?.capture('Error', { message: 'Could not import addresses from QR code scan' })
        }

        dispatch(newWalletImportedWithMetadata(wallet))

        posthog?.capture('Imported wallet', { note: 'Scanned desktop wallet QR code' })
      } else {
        dispatch(newWalletGenerated(wallet))
        dispatch(syncAddressesData(wallet.firstAddress.hash))
        dispatch(syncAddressesHistoricBalances(wallet.firstAddress.hash))

        posthog?.capture('Imported wallet', { note: 'Entered mnemonic manually' })
      }

      if (importedData?.contacts) {
        importContacts(importedData.contacts)
      }

      if (!isAuthenticated) {
        setLoading(false)
        navigation.navigate('AddBiometricsScreen', { skipAddressDiscovery: !!importedData?.addresses })
        return
      }

      // We assume the preference of the user to enable biometrics by looking at the auth settings of the current wallet
      if (isAuthenticated && lastActiveWalletAuthType.current === 'biometrics' && hasAvailableBiometrics) {
        await enableBiometrics(wallet.metadataId, wallet.mnemonic)
        dispatch(biometricsEnabled())
      }

      setLoading(false)

      if (!importedData?.addresses) {
        navigation.navigate('ImportWalletAddressDiscoveryScreen')
      } else {
        navigation.navigate('NewWalletSuccessScreen')
      }

      setDecryptedWalletFromQRCode(undefined)
    },
    [dispatch, hasAvailableBiometrics, isAuthenticated, name, navigation, posthog, selectedWords, typedInput]
  )

  const handleWalletImport = () => importWallet(pin)

  const handleQRCodeScan = (data: string) => {
    posthog?.capture('Scanned QR code from desktop wallet')

    setEncryptedWalletFromQRCode(data)
    setIsPasswordModalVisible(true)
  }

  const decryptAndImportWallet = async (password: string) => {
    try {
      const decryptedData = await decryptAsync(password, encryptedWalletFromQRCode, pbkdf2)
      const parsedDecryptedData = JSON.parse(decryptedData) as WalletImportData

      posthog?.capture('Decrypted desktop wallet QR code')

      setDecryptedWalletFromQRCode(parsedDecryptedData)
      importWallet(pin, parsedDecryptedData)
    } catch (e) {
      console.error(e)
      Alert.alert('Could not decrypt wallet with the given password.')
    }
  }

  // Alephium's node code uses 12 as the minimal mnemomic length.
  const isImportButtonVisible = selectedWords.length >= 12 || enablePasteForDevelopment

  return (
    <Screen {...props}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={headerHeight}
      >
        <ScreenSection style={{ flex: 1 }}>
          <ScreenSectionTitle>Secret phrase</ScreenSectionTitle>
          <SecretPhraseBox style={{ backgroundColor: selectedWords.length === 0 ? theme.bg.back1 : theme.bg.primary }}>
            <ScrollView>
              <SecretPhraseWords>
                {selectedWords.length > 0 ? (
                  selectedWords.map((word, index) => (
                    <SelectedWordBox
                      key={`${word.word}-${word.timestamp}`}
                      onPress={() => removeSelectedWord(word)}
                      entering={FadeIn}
                      exiting={FadeOut}
                      layout={Layout.duration(200).delay(200)}
                    >
                      <AppText color="accent" bold>
                        {index + 1}. {word.word}
                      </AppText>
                    </SelectedWordBox>
                  ))
                ) : (
                  <AppText color="secondary">Start entering your phrase... 👇</AppText>
                )}
              </SecretPhraseWords>
            </ScrollView>
          </SecretPhraseBox>
          {isImportButtonVisible && (
            <ActionsContainer>
              <Button title="Import wallet" type="primary" wide onPress={handleWalletImport} />
            </ActionsContainer>
          )}
        </ScreenSection>

        <ScreenSectionBottom>
          <PossibleMatches style={{ padding: possibleMatches.length > 0 ? 15 : 0 }}>
            {possibleMatches.map((word, index) => (
              <PossibleWordBox
                key={`${word}-${index}`}
                onPress={() => selectWord(word)}
                highlight={index === 0}
                entering={FadeIn.delay(index * 100)}
              >
                <Word highlight={index === 0} bold>
                  {word}
                </Word>
              </PossibleWordBox>
            ))}
          </PossibleMatches>
          <WordInput
            value={typedInput}
            onChangeText={setTypedInput}
            onSubmitEditing={handleEnterPress}
            autoFocus
            blurOnSubmit={false}
            autoCorrect={false}
            error={typedInput.split(' ').length > 1 ? 'Please, type the words one by one' : ''}
            label="Type your secret phrase word by word"
          />
        </ScreenSectionBottom>
        {isPinModalVisible && (
          <ConfirmWithAuthModal usePin onConfirm={(pin) => importWallet(pin, decryptedWalletFromQRCode)} />
        )}
        {isCameraOpen && (
          <QRCodeScannerModal
            onClose={closeQRCodeScannerModal}
            onQRCodeScan={handleQRCodeScan}
            text="Scan the animated QR code from the desktop wallet"
            qrCodeMode="animated"
          />
        )}
        {isPasswordModalVisible && (
          <PasswordModal onClose={() => setIsPasswordModalVisible(false)} onPasswordEntered={decryptAndImportWallet} />
        )}
        <SpinnerModal isActive={loading} text="Importing wallet..." />
      </KeyboardAvoidingView>
    </Screen>
  )
}

export default ImportWalletSeedScreen

const SecretPhraseBox = styled.View`
  background-color: ${({ theme }) => theme.bg.secondary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: ${BORDER_RADIUS}px;
  margin-bottom: 40px;
`

const SecretPhraseWords = styled.View`
  padding: 15px;
  flex-direction: row;
  flex-wrap: wrap;
`

const ActionsContainer = styled.View`
  justify-content: center;
  align-items: center;
  margin-top: 40px;
`

const ScreenSectionBottom = styled(ScreenSection)`
  background-color: ${({ theme }) => theme.bg.back2};
  padding: 0;
`

const PossibleMatches = styled(Animated.View)`
  flex-direction: row;
  flex-wrap: wrap;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.border.primary};
`

const WordInput = styled(Input)`
  margin: 10px 15px;
  background-color: ${({ theme }) => theme.bg.primary};
`

const Word = styled(AppText)<{ highlight?: boolean }>`
  color: ${({ highlight, theme }) => (highlight ? theme.font.contrast : theme.global.accent)};
`

const WordBox = styled(Animated.createAnimatedComponent(Pressable))`
  background-color: ${({ theme }) => theme.bg.primary};
  padding: 10px 16px;
  margin: 0 10px 10px 0;
  border-radius: ${BORDER_RADIUS_SMALL}px;
`

const PossibleWordBox = styled(WordBox)<{ highlight?: boolean }>`
  background-color: ${({ highlight, theme }) =>
    highlight ? theme.global.accent : colord(theme.global.accent).alpha(0.1).toHex()};
`

const SelectedWordBox = styled(WordBox)`
  background-color: ${({ theme }) => colord(theme.global.accent).alpha(0.2).toHex()};
`

const ScanButton = styled.Pressable`
  flex-direction: row;
  align-items: center;
`

const ScanText = styled.Text`
  margin-right: 20px;
  color: ${({ theme }) => theme.global.accent};
  font-size: 16px;
  font-weight: 600;
`
