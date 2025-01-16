import { keyring } from '@alephium/keyring'
import { bip39Words } from '@alephium/shared'
import { colord } from 'colord'
import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import {
  FloatingPanel,
  FooterActionsContainer,
  PanelContentContainer
} from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import Paragraph from '@/components/Paragraph'
import { useStepsContext } from '@/contexts/steps'
import { useWalletContext } from '@/contexts/wallet'
import useAnalytics from '@/features/analytics/useAnalytics'

const ImportWordsPage = () => {
  const { t } = useTranslation()
  const { onButtonBack, onButtonNext } = useStepsContext()
  const { setMnemonic } = useWalletContext()
  const { sendAnalytics } = useAnalytics()

  const [phrase, setPhrase] = useState('')
  const [error, setError] = useState<string | null>(null)
  const allowedWords = useRef(bip39Words)

  // Alephium's node code uses 12 as the minimal mnemonic length.
  const isPhraseLongEnough = phrase.trim().split(/\s+/).length >= 12

  const handlePhraseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitizedValue = sanitizePhrase(e.target.value)
    setPhrase(sanitizedValue)
    setError(null) // Reset error when typing
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (phrase.trim().length > 0 && !phrase.endsWith(' ')) {
        setPhrase((prev) => `${prev} `) // Add a space only if not already at the end
      }
    }

    // Allow only letters and spaces
    const isLetter = /^[a-zA-Z]$/
    if (!isLetter.test(e.key) && e.key !== ' ' && e.key !== 'Backspace') {
      e.preventDefault()
    }

    // Prevent multiple consecutive spaces
    if (e.key === ' ' && phrase.endsWith(' ')) {
      e.preventDefault()
    }
  }

  const handleNextButtonPress = () => {
    const words = phrase.trim().split(/\s+/)
    const invalidWords = words.filter((word) => !allowedWords.current.includes(word))

    if (invalidWords.length > 0) {
      setError(t('Invalid mnemonic. Please double check your words.'))
      return
    }

    if (words.length < 12) return

    sendAnalytics({ event: 'Importing wallet: Entering words: Clicked next' })

    try {
      setMnemonic(keyring.importMnemonicString(words.join(' ')))

      onButtonNext()
    } catch (error) {
      setError(t('Invalid mnemonic. Please double check your words.'))
      sendAnalytics({ type: 'error', error, message: 'Could not import mnemonic string', isSensitive: true })
    } finally {
      setPhrase('')
    }
  }

  const words = phrase.length > 0 && phrase[0] !== '' ? phrase.trim().split(/\s+/) : []
  const firstColumnWords = words.slice(0, 12)
  const secondColumnWords = words.slice(12, 24)

  return (
    <ImportWordsPageStyled>
      <MainPanel horizontalAlign="center" noMargin layout="position">
        <PanelTitle color="primary">{t('Secret recovery phrase')}</PanelTitle>
        <PanelContentContainer>
          <Paragraph secondary centered>
            {t("Make sure to store the words in a secure location! They are your wallet's secret recovery phrase.")}
          </Paragraph>
          <TextAreaContainer>
            <TextArea
              value={phrase}
              placeholder={t('Type your recovery phrase')}
              onChange={handlePhraseChange}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </TextAreaContainer>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </PanelContentContainer>
        <FooterActionsContainer>
          <Button role="secondary" onClick={onButtonBack} tall>
            {t('Cancel')}
          </Button>
          <Button onClick={handleNextButtonPress} disabled={!isPhraseLongEnough} tall>
            {t('Continue')}
          </Button>
        </FooterActionsContainer>
      </MainPanel>
      <AnimatePresence>
        {words.length > 0 && (
          <WordListPanel noMargin layout="position">
            <WordBox>
              <WordGrid>
                <WordColumn>
                  {firstColumnWords.map((word, index) => (
                    <MnemonicWordContainer key={index}>
                      <MnemonicNumber>{index + 1}</MnemonicNumber>
                      <MnemonicWord isInvalid={!allowedWords.current.includes(word)}>{word}</MnemonicWord>
                    </MnemonicWordContainer>
                  ))}
                </WordColumn>
                {secondColumnWords.length > 0 && (
                  <WordColumn>
                    {secondColumnWords.map((word, index) => (
                      <MnemonicWordContainer key={index + 12}>
                        <MnemonicNumber>{index + 13}</MnemonicNumber>
                        <MnemonicWord isInvalid={!allowedWords.current.includes(word)}>{word}</MnemonicWord>
                      </MnemonicWordContainer>
                    ))}
                  </WordColumn>
                )}
              </WordGrid>
            </WordBox>
          </WordListPanel>
        )}
      </AnimatePresence>
    </ImportWordsPageStyled>
  )
}

const sanitizePhrase = (input: string): string =>
  input
    .replace(/[^a-zA-Z\s]/g, '') // Remove non-letter characters
    .replace(/\n/g, ' ') // Replace any existing newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space

export default ImportWordsPage

const ImportWordsPageStyled = styled.div`
  display: flex;
  gap: 16px;
  margin: auto;
`

const MainPanel = styled(FloatingPanel)`
  max-width: 600px;
  height: 600px;
`

const TextAreaContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: stretch;
  align-items: center;
  width: 100%;
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border-radius: var(--radius-medium);
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.font.primary};
  height: 240px;
  resize: none;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.global.accent};
  }
`

const WordListPanel = styled(FloatingPanel)`
  flex: 0;
`

const WordBox = styled.div``

const WordGrid = styled(motion.div)`
  display: flex;
  justify-content: center;
  gap: 10px;
`

const WordColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 120px;
`

const MnemonicWordContainer = styled.div`
  display: flex;
  margin: 6px;
  border-radius: var(--radius-small);
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.secondary};
`

const MnemonicWord = styled.div<{ isInvalid: boolean }>`
  padding: var(--spacing-1) 8px;
  font-weight: var(--fontWeight-semiBold);
  color: ${({ isInvalid, theme }) => (isInvalid ? 'red' : theme.font.primary)};
`

const MnemonicNumber = styled.div`
  padding: var(--spacing-1);
  border-right: 1px solid ${({ theme }) => theme.bg.secondary};
  background-color: ${({ theme }) =>
    theme.name === 'light'
      ? colord(theme.font.primary).alpha(0.8).toRgbString()
      : colord(theme.font.contrastPrimary).alpha(0.8).toRgbString()};
  color: ${({ theme }) => (theme.name === 'light' ? theme.font.contrastPrimary : theme.font.primary)};
`

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.global.alert};
  margin: 8px 0;
  font-weight: bold;
  text-align: center;
`
