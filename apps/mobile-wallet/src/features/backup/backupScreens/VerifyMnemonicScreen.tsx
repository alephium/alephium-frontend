import { bip39Words } from '@alephium/shared'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { shuffle } from 'lodash'
import LottieView from 'lottie-react-native'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import animationSrc from '~/animations/lottie/success.json'
import AppText from '~/components/AppText'
import { BackButton } from '~/components/buttons/Button'
import { ScreenProps, ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'
import SecretPhraseWordList, { SelectedWord } from '~/components/SecretPhraseWordList'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { BackupMnemonicNavigationParamList } from '~/navigation/BackupMnemonicNavigation'
import { dangerouslyExportWalletMnemonic, updateStoredWalletMetadata } from '~/persistent-storage/wallet'
import { PossibleWordBox, SecretPhraseBox, Word } from '~/screens/new-wallet/ImportWalletSeedScreen'
import { mnemonicBackedUp } from '~/store/wallet/walletSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showExceptionToast } from '~/utils/layout'

interface VerifyMnemonicScreenProps
  extends StackScreenProps<BackupMnemonicNavigationParamList, 'VerifyMnemonicScreen'>,
    ScreenProps {}

const VerifyMnemonicScreen = ({ navigation, ...props }: VerifyMnemonicScreenProps) => {
  const dispatch = useAppDispatch()
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)
  const theme = useTheme()
  const allowedWords = useRef(bip39Words)
  const randomizedOptions = useRef<string[][]>([])
  const insets = useSafeAreaInsets()
  const { setHeaderOptions, screenScrollHandler } = useHeaderContext()
  const { t } = useTranslation()

  const [selectedWords, setSelectedWords] = useState<SelectedWord[]>([])
  const [possibleMatches, setPossibleMatches] = useState<string[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [mnemonicWords, setMnemonicWords] = useState<Array<string>>([])

  useEffect(() => {
    try {
      dangerouslyExportWalletMnemonic().then((mnemonic) => {
        const words = mnemonic.split(' ')
        setMnemonicWords(words)
        randomizedOptions.current = getRandomizedOptions(words, allowedWords.current)
        setPossibleMatches(randomizedOptions.current[0])
      })
    } catch (e) {
      if (__DEV__) console.error(e)
    }
  }, [])

  const confirmBackup = useCallback(async () => {
    if (!isMnemonicBackedUp) {
      try {
        await updateStoredWalletMetadata({ isMnemonicBackedUp: true })
        dispatch(mnemonicBackedUp())

        sendAnalytics({ event: 'Backed-up mnemonic' })
      } catch (error) {
        const message = 'Could not confirm backup'

        showExceptionToast(error, t(message))
        sendAnalytics({ type: 'error', error, message })
      }
    }
  }, [isMnemonicBackedUp, dispatch, t])

  useEffect(() => {
    if (selectedWords.length < mnemonicWords.length) {
      setPossibleMatches(randomizedOptions.current[selectedWords.length])
    } else if (selectedWords.length > 0) {
      confirmBackup()
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        navigation.navigate('VerificationSuccessScreen')
      }, 2000)
    }
  }, [confirmBackup, mnemonicWords.length, navigation, randomizedOptions, selectedWords.length])

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => <BackButton onPress={() => navigation.goBack()} />
      })
    }, [navigation, setHeaderOptions])
  )

  const selectWord = (word: string) => {
    if (!word) return

    if (word !== mnemonicWords[selectedWords.length]) {
      Alert.alert(
        t('This is not the word in position {{ positionIndex }}', { positionIndex: selectedWords.length + 1 }),
        t('Please, verify that you wrote your secret phrase down correctly and try again.')
      )
      return
    }

    setSelectedWords(selectedWords.concat([{ word, timestamp: new Date() }]))
  }

  return (
    <>
      <ScrollScreen
        fill
        verticalGap
        headerOptions={{ type: 'stack' }}
        contentPaddingTop
        onScroll={screenScrollHandler}
        screenTitle={t('Verify secret phrase')}
        screenIntro={t('Select the words of your secret recovery phrase in the right order.')}
        {...props}
      >
        <ScreenSection fill>
          {selectedWords.length > 0 && (
            <SecretPhraseBox
              style={{ backgroundColor: selectedWords.length === 0 ? theme.bg.back1 : theme.bg.primary }}
            >
              <SecretPhraseWordList words={selectedWords} />
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
            {t('Word {{ wordIndex }} is:', { wordIndex: selectedWords.length + 1 })}
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
  height: 100%;
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
