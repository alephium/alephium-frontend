import { dangerouslyConvertUint8ArrayMnemonicToString } from '@alephium/keyring'
import { shuffle } from 'lodash'
import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import {
  FloatingPanel,
  FooterActionsContainer,
  PanelContentContainer,
  Section
} from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'
import { useStepsContext } from '@/contexts/steps'
import { useWalletContext } from '@/contexts/wallet'
import useAnalytics from '@/features/analytics/useAnalytics'

const CheckWordsPage = () => {
  const { t } = useTranslation()
  const { onButtonBack, onButtonNext } = useStepsContext()
  const { mnemonic } = useWalletContext()
  const { sendAnalytics } = useAnalytics()

  const [mnemonicWords, setMnemonicWords] = useState<string[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [options, setOptions] = useState<string[]>([])
  const [isError, setIsError] = useState(false)

  const nextWordIndex = currentWordIndex + 1

  useEffect(() => {
    if (!mnemonic) return

    const words = dangerouslyConvertUint8ArrayMnemonicToString(mnemonic).split(' ')
    setMnemonicWords(words)
    setCurrentWordIndex(0)
    setOptions(generateOptions(words, 0))
  }, [mnemonic])

  const handleOptionClick = (selectedWord: string) => {
    const correctWord = mnemonicWords[currentWordIndex]
    if (selectedWord === correctWord) {
      if (nextWordIndex < mnemonicWords.length) {
        setCurrentWordIndex(nextWordIndex)
        setOptions(generateOptions(mnemonicWords, nextWordIndex))
        setIsError(false)
      } else {
        sendAnalytics({ event: 'Creating wallet: Verifying words: Completed' })
        onButtonNext()
      }
    } else {
      setIsError(true)
    }
  }

  const handleBackButtonPress = () => {
    sendAnalytics({ event: 'Creating wallet: Verifying words: Clicked back' })
    onButtonBack()
  }

  return (
    <FloatingPanel>
      <PanelContentContainer>
        <Section align="center">
          <Paragraph centered>
            <Trans
              t={t}
              i18nKey="Select the correct word for word number <1>{{ number }} of 24</1>."
              values={{ number: nextWordIndex }}
              components={{ 1: <b /> }}
            />
          </Paragraph>
          {isError && <ErrorText>{t('Incorrect word. Please try again.')}</ErrorText>}
          <OptionsContainer>
            {options.map((option, index) => (
              <OptionButton key={index} onClick={() => handleOptionClick(option)} squared>
                {nextWordIndex}. {option}
              </OptionButton>
            ))}
          </OptionsContainer>
        </Section>
      </PanelContentContainer>
      <FooterActionsContainer>
        <Button role="secondary" onClick={handleBackButtonPress} tall>
          {t('Cancel')}
        </Button>
      </FooterActionsContainer>
    </FloatingPanel>
  )
}

const generateOptions = (words: string[], index: number): string[] => {
  const correctWord = words[index]
  const otherWords = words.filter((w, i) => i !== index)
  const randomWords = shuffle(otherWords).slice(0, 2)
  return shuffle([correctWord, ...randomWords])
}

export default CheckWordsPage

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: var(--spacing-4) 0;
  justify-content: center;
`

const OptionButton = styled(Button)`
  margin: var(--spacing-2);
  font-family: monospace;
`

const ErrorText = styled.p`
  color: ${({ theme }) => theme.global.alert};
  margin-top: var(--spacing-2);
`
