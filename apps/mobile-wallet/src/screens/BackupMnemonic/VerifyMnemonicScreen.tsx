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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { shuffle } from 'lodash'
import LottieView from 'lottie-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import animationSrc from '~/animations/lottie/success.json'
import AppText from '~/components/AppText'
import { BackButton } from '~/components/buttons/Button'
import { ScreenProps, ScreenSection } from '~/components/layout/Screen'
import ScreenIntro from '~/components/layout/ScreenIntro'
import ScrollScreen from '~/components/layout/ScrollScreen'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'
import SecretPhraseWordList, { SelectedWord } from '~/components/SecretPhraseWordList'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { BackupMnemonicNavigationParamList } from '~/navigation/BackupMnemonicNavigation'
import { persistWalletMetadata } from '~/persistent-storage/wallet'
import { PossibleWordBox, SecretPhraseBox, Word } from '~/screens/new-wallet/ImportWalletSeedScreen'
import { mnemonicBackedUp } from '~/store/wallet/walletSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { bip39Words } from '~/utils/bip39'

interface VerifyMnemonicScreenProps
  extends StackScreenProps<BackupMnemonicNavigationParamList, 'VerifyMnemonicScreen'>,
    ScreenProps {}

const VerifyMnemonicScreen = ({ navigation, ...props }: VerifyMnemonicScreenProps) => {
  const dispatch = useAppDispatch()
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)
  const walletMnemonic = useAppSelector((s) => s.wallet.mnemonic)
  const mnemonicWords = useRef(walletMnemonic.split(' '))
  const theme = useTheme()
  const allowedWords = useRef(bip39Words.split(' '))
  const randomizedOptions = useRef(getRandomizedOptions(mnemonicWords.current, allowedWords.current))
  const insets = useSafeAreaInsets()
  const { setHeaderOptions, screenScrollHandler } = useHeaderContext()

  const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([])
  const [possibleMatches, setPossibleMatches] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  const confirmBackup = useCallback(async () => {
    if (!isMnemonicBackedUp) {
      await persistWalletMetadata({ isMnemonicBackedUp: true })
      dispatch(mnemonicBackedUp())

      sendAnalytics('Backed-up mnemonic')
    }
  }, [isMnemonicBackedUp, dispatch])

  useEffect(() => {
    if (selectedWords.length < mnemonicWords.current.length) {
      setPossibleMatches(randomizedOptions.current[selectedWords.length])
    } else {
      confirmBackup()
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        navigation.navigate('VerificationSuccessScreen')
      }, 2000)
    }
  }, [confirmBackup, mnemonicWords.current.length, navigation, randomizedOptions, selectedWords.length])

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => <BackButton onPress={() => navigation.goBack()} />
      })
    }, [navigation, setHeaderOptions])
  )

  const selectWord = (word: string) => {
    if (!word) return

    if (word !== mnemonicWords.current[selectedWords.length]) {
      Alert.alert(
        `This is not the word in position ${selectedWords.length + 1}`,
        'Please, verify that you wrote your secret phrase down correctly and try again.'
      )
      return
    }

    setSelectedWords(selectedWords.concat([{ word, timestamp: new Date() }]))
  }

  return (
    <>
      <ScrollScreen fill verticalGap contentPaddingTop onScroll={screenScrollHandler} {...props}>
        <ScreenIntro
          title="Verify secret phrase"
          subtitle="Select the words of your secret recovery phrase in the right order."
        />

        <ScreenSection fill>
          {selectedWords.length > 0 && (
            <SecretPhraseBox
              style={{ backgroundColor: selectedWords.length === 0 ? theme.bg.back1 : theme.bg.primary }}
            >
              <SecretPhraseWordList words={selectedWords} color="valid" />
            </SecretPhraseBox>
          )}
        </ScreenSection>

        {showSuccess && (
          <ModalWithBackdrop animationType="fade" visible closeModal={() => setShowSuccess(false)}>
            <ModalContent>
              <StyledAnimation source={animationSrc} autoPlay loop={false} />
            </ModalContent>
          </ModalWithBackdrop>
        )}
      </ScrollScreen>
      {selectedWords.length < 24 && (
        <ChoicesBox
          style={{ padding: possibleMatches.length > 0 ? 15 : 0, paddingBottom: insets.bottom + DEFAULT_MARGIN }}
        >
          <AppText size={16} bold color="secondary" style={{ marginBottom: DEFAULT_MARGIN }}>
            Word {selectedWords.length + 1} is:
          </AppText>

          <WordsList>
            {possibleMatches.map((word, index) => (
              <PossibleWordBox
                key={`${word}-${index}`}
                onPress={() => selectWord(word)}
                entering={FadeIn.delay(index * 100)}
              >
                <Word bold>{word}</Word>
              </PossibleWordBox>
            ))}
          </WordsList>
        </ChoicesBox>
      )}
    </>
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

const ChoicesBox = styled(Animated.View)`
  background-color: ${({ theme }) => theme.bg.secondary};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.border.primary};
  align-items: center;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
`

const WordsList = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`
