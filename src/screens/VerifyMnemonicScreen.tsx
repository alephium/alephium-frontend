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
import { shuffle } from 'lodash'
import LottieView from 'lottie-react-native'
import { usePostHog } from 'posthog-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import { FadeIn, FadeOut, Layout } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import animationSrc from '~/animations/lottie/success.json'
import AppText from '~/components/AppText'
import { ScreenProps, ScreenSection, ScreenSectionTitle } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { persistWalletMetadata } from '~/persistent-storage/wallets'
import {
  PossibleMatches,
  PossibleWordBox,
  SecretPhraseBox,
  SecretPhraseWords,
  SelectedWord,
  Word,
  WordBox
} from '~/screens/new-wallet/ImportWalletSeedScreen'
import { mnemonicBackedUp } from '~/store/activeWalletSlice'
import { bip39Words } from '~/utils/bip39'

interface VerifyMnemonicScreenProps extends StackScreenProps<RootStackParamList, 'VerifyMnemonicScreen'>, ScreenProps {}

const VerifyMnemonicScreen = ({ navigation, ...props }: VerifyMnemonicScreenProps) => {
  const dispatch = useAppDispatch()
  const isMnemonicBackedUp = useAppSelector((s) => s.activeWallet.isMnemonicBackedUp)
  const metadataId = useAppSelector((s) => s.activeWallet.metadataId)
  const activeWalletMnemonic = useAppSelector((s) => s.activeWallet.mnemonic)
  const mnemonicWords = useRef(activeWalletMnemonic.split(' '))
  const theme = useTheme()
  const allowedWords = useRef(bip39Words.split(' '))
  const randomizedOptions = useRef(getRandomizedOptions(mnemonicWords.current, allowedWords.current))
  const posthog = usePostHog()

  const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([])
  const [possibleMatches, setPossibleMatches] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  const confirmBackup = useCallback(async () => {
    if (!isMnemonicBackedUp) {
      await persistWalletMetadata(metadataId, { isMnemonicBackedUp: true })
      dispatch(mnemonicBackedUp())

      posthog?.capture('Backed-up mnemonic')
    }
  }, [isMnemonicBackedUp, metadataId, dispatch, posthog])

  useEffect(() => {
    if (selectedWords.length < mnemonicWords.current.length) {
      setPossibleMatches(randomizedOptions.current[selectedWords.length])
    } else {
      confirmBackup()
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        navigation.goBack()
      }, 2000)
    }
  }, [confirmBackup, mnemonicWords.current.length, navigation, randomizedOptions, selectedWords.length])

  const selectWord = (word: string) => {
    if (!word) return

    if (word !== mnemonicWords.current[selectedWords.length]) {
      Alert.alert(
        `This is not the word in position ${selectedWords.length + 1}`,
        'Verify you wrote down your secret phrase correctly and try again.'
      )
      return
    }

    setSelectedWords(selectedWords.concat([{ word, timestamp: new Date() }]))
  }

  return (
    <ScrollScreen fill headerOptions={{ headerTitle: 'Verify', type: 'stack' }} {...props}>
      <ScreenSection fill>
        <ScreenSectionTitle>Secret phrase</ScreenSectionTitle>
        <SecretPhraseBox style={{ backgroundColor: selectedWords.length === 0 ? theme.bg.back1 : theme.bg.primary }}>
          <SecretPhraseWords>
            {selectedWords.length > 0 ? (
              selectedWords.map((word, index) => (
                <SelectedWordBox
                  key={`${word.word}-${word.timestamp}`}
                  entering={FadeIn}
                  exiting={FadeOut}
                  layout={Layout.duration(200).delay(200)}
                >
                  <AppText color="valid" bold>
                    {index + 1}. {word.word}
                  </AppText>
                </SelectedWordBox>
              ))
            ) : (
              <AppText color="secondary">Select the words in the correct order 👇</AppText>
            )}
          </SecretPhraseWords>
        </SecretPhraseBox>
      </ScreenSection>

      <ScreenSection>
        <PossibleMatches style={{ padding: possibleMatches.length > 0 ? 15 : 0 }}>
          {possibleMatches.map((word, index) => (
            <PossibleWordBox
              key={`${word}-${index}`}
              onPress={() => selectWord(word)}
              entering={FadeIn.delay(index * 100)}
            >
              <Word bold>{word}</Word>
            </PossibleWordBox>
          ))}
        </PossibleMatches>
      </ScreenSection>

      {showSuccess && (
        <ModalWithBackdrop animationType="fade" visible closeModal={() => setShowSuccess(false)}>
          <ModalContent>
            <StyledAnimation source={animationSrc} autoPlay loop={false} />
          </ModalContent>
        </ModalWithBackdrop>
      )}
    </ScrollScreen>
  )
}

export default VerifyMnemonicScreen

const getRandomizedOptions = (mnemonicWords: string[], allowedWords: string[]) =>
  mnemonicWords.map((mnemonicWord) => {
    let randomWords = allowedWords.filter((allowedWord) => allowedWord !== mnemonicWord)
    const firstRandomWord = randomWords[Math.floor(Math.random() * randomWords.length)]

    randomWords = randomWords.filter((word) => word !== firstRandomWord)
    const secondRandomWord = randomWords[Math.floor(Math.random() * randomWords.length)]

    return shuffle([mnemonicWord, firstRandomWord, secondRandomWord])
  })

const SelectedWordBox = styled(WordBox)`
  background-color: ${({ theme }) => colord(theme.global.valid).alpha(0.2).toHex()};
`

const ModalContent = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: ${({ theme }) => theme.bg.back2};
`

const StyledAnimation = styled(LottieView)`
  width: 80%;
`
