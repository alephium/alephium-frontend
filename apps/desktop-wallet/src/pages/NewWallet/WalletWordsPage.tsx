import { dangerouslyConvertUint8ArrayMnemonicToString, keyring } from '@alephium/keyring'
import { Edit3 } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import {
  FloatingPanel,
  FooterActionsContainer,
  PanelContentContainer,
  Section
} from '@/components/PageComponents/PageContainers'
import { useStepsContext } from '@/contexts/steps'
import { useWalletContext } from '@/contexts/wallet'
import useAnalytics from '@/features/analytics/useAnalytics'

const WalletWordsPage = () => {
  const { onButtonBack, onButtonNext } = useStepsContext()
  const { mnemonic, setMnemonic, resetCachedMnemonic } = useWalletContext()
  const { t } = useTranslation()
  const { sendAnalytics } = useAnalytics()

  useEffect(() => {
    if (!mnemonic) {
      try {
        setMnemonic(keyring.generateRandomMnemonic())
      } catch (error) {
        sendAnalytics({ type: 'error', error, message: 'Could not generate new mnemonic', isSensitive: true })
      }
    }
  }, [mnemonic, sendAnalytics, setMnemonic])

  if (!mnemonic) return null

  const renderMnemonicWords = () => {
    const mnemonicWords = dangerouslyConvertUint8ArrayMnemonicToString(mnemonic).split(' ')

    const columnCount = Math.ceil(mnemonicWords.length / 6) // Number of columns (6 words per column)

    // Distribute words into columns
    const wordsByColumns = Array.from({ length: columnCount }, (_, colIndex) =>
      mnemonicWords.slice(colIndex * 6, (colIndex + 1) * 6)
    )

    return (
      <MnemonicColumnsContainer>
        {wordsByColumns.map((columnWords, colIndex) => (
          <MnemonicColumn key={colIndex} isLastColumn={colIndex === columnCount - 1}>
            {columnWords.map((word, rowIndex) => (
              <MnemonicWordContainer key={`${colIndex}-${rowIndex}`}>
                <MnemonicNumber>{colIndex * 6 + rowIndex + 1}.</MnemonicNumber>
                <MnemonicWord>{word}</MnemonicWord>
              </MnemonicWordContainer>
            ))}
          </MnemonicColumn>
        ))}
      </MnemonicColumnsContainer>
    )
  }

  const handleBackPress = () => {
    sendAnalytics({ event: 'Creating wallet: Writing down mnemonic: Clicked back' })
    keyring.clear()
    resetCachedMnemonic()
    onButtonBack()
  }

  const handleNextPress = () => {
    sendAnalytics({ event: 'Creating wallet: Writing down mnemonic: Clicked next' })
    onButtonNext()
  }

  return (
    <FloatingPanel enforceMinHeight>
      <PanelContentContainer>
        <WordsContent inList>
          <Label>{t('Secret recovery phrase')}</Label>
          <PhraseBox>{renderMnemonicWords()}</PhraseBox>
          <InfoBox
            text={t("Carefully note down the words! They are your wallet's secret recovery phrase.")}
            Icon={Edit3}
            importance="alert"
          />
        </WordsContent>
      </PanelContentContainer>
      <FooterActionsContainer>
        <Button onClick={handleBackPress} tall role="secondary">
          {t('Back')}
        </Button>
        <Button onClick={handleNextPress} tall>
          {t("I've copied the words, continue")}
        </Button>
      </FooterActionsContainer>
    </FloatingPanel>
  )
}

export default WalletWordsPage

const Label = styled.label`
  width: 100%;
  padding-bottom: var(--spacing-2);
  color: ${({ theme }) => theme.font.secondary};
  font-weight: var(--fontWeight-semiBold);
  font-size: 16px;
`

const WordsContent = styled(Section)`
  justify-content: flex-start;
`

const PhraseBox = styled.div`
  width: 100%;
  padding: var(--spacing-4) 0;
  color: ${({ theme }) => theme.font.contrastPrimary};
  font-weight: var(--fontWeight-medium);
  border-radius: var(--radius-big);
  margin-bottom: var(--spacing-4);
`

const MnemonicColumnsContainer = styled.div`
  display: flex;
`

const MnemonicColumn = styled.div<{ isLastColumn: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 8px;
  gap: 10px;
  border-right: ${({ theme, isLastColumn }) => (isLastColumn ? 'none' : `1px solid ${theme.font.tertiary}`)};
`

const MnemonicWordContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  border-radius: var(--radius-small);
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg.contrast};
`

const MnemonicNumber = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.font.contrastSecondary};
  padding: 8px 6px;
`

const MnemonicWord = styled.div`
  flex: 1;
  color: ${({ theme }) => theme.font.contrastPrimary};
  font-size: 14px;
`
