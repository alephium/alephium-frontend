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
import { colord } from 'colord'
import { BlurView } from 'expo-blur'
import { usePostHog } from 'posthog-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { KeyboardAvoidingView, Pressable, ScrollView } from 'react-native'
import Animated, { FadeIn, FadeOut, Layout, LinearTransition } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { ContinueButton } from '~/components/buttons/Button'
import ConfirmWithAuthModal from '~/components/ConfirmWithAuthModal'
import Input from '~/components/inputs/Input'
import { ScreenProps } from '~/components/layout/Screen'
import ScreenIntro from '~/components/layout/ScreenIntro'
import ScrollScreen from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import useBiometrics from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { enableBiometrics, generateAndStoreWallet } from '~/persistent-storage/wallets'
import { biometricsEnabled } from '~/store/activeWalletSlice'
import { syncAddressesData, syncAddressesHistoricBalances } from '~/store/addressesSlice'
import { newWalletGenerated } from '~/store/wallet/walletActions'
import { BORDER_RADIUS, BORDER_RADIUS_SMALL, DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'
import { bip39Words } from '~/utils/bip39'

interface ImportWalletSeedScreenProps
  extends StackScreenProps<RootStackParamList, 'ImportWalletSeedScreen'>,
    ScreenProps {}

export type SelectedWord = {
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

  const isAuthenticated = !!activeWalletMnemonic

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
    async (pin?: string) => {
      if (!name) return

      if (!pin) {
        setIsPinModalVisible(true)
        return
      }

      setLoading(true)

      const mnemonicToImport = enablePasteForDevelopment ? typedInput : selectedWords.map(({ word }) => word).join(' ')

      const wallet = await generateAndStoreWallet(name, pin, mnemonicToImport)

      dispatch(newWalletGenerated(wallet))
      dispatch(syncAddressesData(wallet.firstAddress.hash))
      dispatch(syncAddressesHistoricBalances(wallet.firstAddress.hash))

      posthog?.capture('Imported wallet', { note: 'Entered mnemonic manually' })

      if (!isAuthenticated) {
        setLoading(false)
        navigation.navigate('AddBiometricsScreen')
        return
      }

      // We assume the preference of the user to enable biometrics by looking at the auth settings of the current wallet
      if (isAuthenticated && lastActiveWalletAuthType.current === 'biometrics' && hasAvailableBiometrics) {
        await enableBiometrics(wallet.metadataId, wallet.mnemonic)
        dispatch(biometricsEnabled())
      }

      setLoading(false)

      navigation.navigate('NewWalletSuccessScreen')
    },
    [dispatch, hasAvailableBiometrics, isAuthenticated, name, navigation, posthog, selectedWords, typedInput]
  )

  const handleWalletImport = () => importWallet(pin)

  // Alephium's node code uses 12 as the minimal mnemomic length.
  const isImportButtonEnabled = selectedWords.length >= 12 || enablePasteForDevelopment

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
      <ScrollScreenStyled
        fill
        headerOptions={{
          type: 'stack',
          headerRight: () => <ContinueButton onPress={handleWalletImport} disabled={!isImportButtonEnabled} />
        }}
        keyboardShouldPersistTaps="always"
        {...props}
      >
        <ScreenIntro title="Secret phrase" subtitle={`Enter the secret phrase for the "${name}" wallet.`} />
        <SecretPhraseContainer>
          {selectedWords.length > 0 && (
            <SecretPhraseBox
              style={{ backgroundColor: selectedWords.length === 0 ? theme.bg.back1 : theme.bg.primary }}
            >
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
          )}
        </SecretPhraseContainer>

        {isPinModalVisible && <ConfirmWithAuthModal usePin onConfirm={importWallet} />}
        {loading && <SpinnerModal isActive={loading} text="Importing wallet..." />}
      </ScrollScreenStyled>

      <BottomInputContainer
        tint={theme.name}
        intensity={80}
        style={{
          borderTopWidth: possibleMatches.length > 0 ? 1 : 0,
          paddingTop: possibleMatches.length === 0 ? 10 : 0
        }}
      >
        <PossibleMatches style={{ padding: possibleMatches.length > 0 ? 15 : 0 }}>
          {possibleMatches.map((word, index) => (
            <PossibleWordBox
              key={`${word}-${index}`}
              onPress={() => selectWord(word)}
              highlight={index === 0}
              entering={FadeIn.delay(index * 100)}
              style={{ marginBottom: 0 }}
            >
              <Word highlight={index === 0} bold style={{ paddingVertical: 3, paddingHorizontal: 5 }}>
                {word}
              </Word>
            </PossibleWordBox>
          ))}
        </PossibleMatches>
        <Row>
          <WordInput
            value={typedInput}
            onChangeText={setTypedInput}
            onSubmitEditing={handleEnterPress}
            autoFocus
            blurOnSubmit={false}
            autoCorrect={false}
            error={typedInput.split(' ').length > 1 ? 'Please, type the words one by one' : ''}
            label={`Type the ${selectedWords.length === 0 ? 'first' : 'next'} word`}
            layout={LinearTransition}
          />
        </Row>
      </BottomInputContainer>
    </KeyboardAvoidingView>
  )
}

export default ImportWalletSeedScreen

const ScrollScreenStyled = styled(ScrollScreen)`
  padding-bottom: 70px;
`

const SecretPhraseContainer = styled.View`
  flex: 1;
  margin: ${VERTICAL_GAP}px ${DEFAULT_MARGIN}px;
`

export const SecretPhraseBox = styled.View`
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: ${BORDER_RADIUS}px;
`

export const SecretPhraseWords = styled.View`
  padding: 15px;
  flex-direction: row;
  flex-wrap: wrap;
`

const BottomInputContainer = styled(BlurView)`
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  padding: 0 ${DEFAULT_MARGIN}px 10px;
  border-top-color: ${({ theme }) => theme.border.primary};
  flex: 0;
`

const PossibleMatches = styled(Animated.View)`
  flex-direction: row;
  flex-wrap: wrap;
  border-radius: ${BORDER_RADIUS}px;
`

const WordInput = styled(Input)`
  background-color: ${({ theme }) => theme.bg.highlight};
  flex-grow: 1;
`

export const Word = styled(AppText)<{ highlight?: boolean }>`
  color: ${({ highlight, theme }) => (highlight ? theme.font.contrast : theme.global.accent)};
`

export const WordBox = styled(Animated.createAnimatedComponent(Pressable))`
  background-color: ${({ theme }) => theme.bg.primary};
  padding: 7px 10px;
  margin: 0 10px 10px 0;
  border-radius: ${BORDER_RADIUS_SMALL}px;
`

export const PossibleWordBox = styled(WordBox)<{ highlight?: boolean }>`
  background-color: ${({ highlight, theme }) =>
    highlight ? theme.global.accent : colord(theme.global.accent).alpha(0.1).toHex()};
`

export const SelectedWordBox = styled(WordBox)`
  background-color: ${({ theme }) => colord(theme.global.accent).alpha(0.2).toHex()};
`

const Row = styled.View`
  flex-direction: row;
  gap: 10px;
  align-items: center;
`
