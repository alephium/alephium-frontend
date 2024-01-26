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
import { colord } from 'colord'
import { BlurView } from 'expo-blur'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, KeyboardAvoidingView, ScrollView } from 'react-native'
import { FadeIn } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import { ContinueButton } from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenProps } from '~/components/layout/Screen'
import ScreenIntro from '~/components/layout/ScreenIntro'
import ScrollScreen from '~/components/layout/ScrollScreen'
import SecretPhraseWordList, { SelectedWord, WordBox } from '~/components/SecretPhraseWordList'
import SpinnerModal from '~/components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import useBiometrics from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { generateAndStoreWallet } from '~/persistent-storage/wallet'
import { syncAddressesData, syncAddressesHistoricBalances } from '~/store/addressesSlice'
import { newWalletGenerated } from '~/store/wallet/walletActions'
import { BORDER_RADIUS, DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'
import { bip39Words } from '~/utils/bip39'
import { resetNavigation } from '~/utils/navigation'

interface ImportWalletSeedScreenProps
  extends StackScreenProps<RootStackParamList, 'ImportWalletSeedScreen'>,
    ScreenProps {}

const enablePasteForDevelopment = false

const ImportWalletSeedScreen = ({ navigation, ...props }: ImportWalletSeedScreenProps) => {
  const dispatch = useAppDispatch()
  const name = useAppSelector((s) => s.walletGeneration.walletName)
  const pin = useAppSelector((s) => s.credentials.pin)
  const deviceHasBiometricsData = useBiometrics()
  const theme = useTheme()
  const allowedWords = useRef(bip39Words.split(' '))

  const [typedInput, setTypedInput] = useState('')
  const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([])
  const [possibleMatches, setPossibleMatches] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

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
      // This should never happen, but if it does, let the user restart the process of creating a wallet
      if (!name || !pin) {
        Alert.alert('Could not proceed', `Missing ${!name ? 'wallet name' : 'pin'}`, [
          {
            text: 'Restart',
            onPress: () => navigation.navigate('LandingScreen')
          }
        ])
        return
      }

      setLoading(true)

      const mnemonicToImport = enablePasteForDevelopment ? typedInput : selectedWords.map(({ word }) => word).join(' ')

      const wallet = await generateAndStoreWallet(name, pin, mnemonicToImport)

      dispatch(newWalletGenerated(wallet))
      dispatch(syncAddressesData(wallet.firstAddress.hash))
      dispatch(syncAddressesHistoricBalances(wallet.firstAddress.hash))

      sendAnalytics('Imported wallet', { note: 'Entered mnemonic manually' })

      resetNavigation(
        navigation,
        deviceHasBiometricsData ? 'AddBiometricsScreen' : 'ImportWalletAddressDiscoveryScreen'
      )

      setLoading(false)
    },
    [name, typedInput, selectedWords, dispatch, navigation, deviceHasBiometricsData]
  )

  const handleWordInputChange = (inputText: string) => {
    const parsedInput = inputText.split(' ')[0]
    setTypedInput(parsedInput)
  }

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
                <SecretPhraseWordList words={selectedWords} onWordPress={removeSelectedWord} />
              </ScrollView>
            </SecretPhraseBox>
          )}
        </SecretPhraseContainer>
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
              style={{ marginBottom: 5 }}
            >
              <Word highlight={index === 0} bold style={{ paddingVertical: 3, paddingHorizontal: 5 }}>
                {word}
              </Word>
            </PossibleWordBox>
          ))}
        </PossibleMatches>

        <WordInput
          value={typedInput}
          onChangeText={handleWordInputChange}
          contextMenuHidden={true}
          onSubmitEditing={handleEnterPress}
          autoFocus
          blurOnSubmit={false}
          autoCorrect={false}
          error={typedInput.split(' ').length > 1 ? 'Please, type the words one by one' : ''}
          label={`Type the ${selectedWords.length === 0 ? 'first' : 'next'} word`}
        />
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

const BottomInputContainer = styled(BlurView)`
  position: absolute;
  bottom: 0;
  right: 0;
  left: 0;
  padding: 0 ${DEFAULT_MARGIN}px 10px;
  border-top-color: ${({ theme }) => theme.border.primary};
  flex: 0;
`

const PossibleMatches = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  border-radius: ${BORDER_RADIUS}px;
`

const WordInput = styled(Input)`
  background-color: ${({ theme }) => theme.bg.highlight};
`

export const Word = styled(AppText)<{ highlight?: boolean }>`
  color: ${({ highlight, theme }) => (highlight ? theme.font.contrast : theme.global.accent)};
`

export const PossibleWordBox = styled(WordBox)<{ highlight?: boolean }>`
  background-color: ${({ highlight, theme }) =>
    highlight ? theme.global.accent : colord(theme.global.accent).alpha(0.1).toHex()};
`
