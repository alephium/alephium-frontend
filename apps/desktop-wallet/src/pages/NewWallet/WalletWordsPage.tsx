import { dangerouslyConvertUint8ArrayMnemonicToString, keyring } from '@alephium/keyring'
import { colord } from 'colord'
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
import PanelTitle from '@/components/PageComponents/PanelTitle'
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

  const renderMnemonicWords = () =>
    dangerouslyConvertUint8ArrayMnemonicToString(mnemonic)
      .split(' ')
      .map((w, i) => (
        <MnemonicWordContainer key={i}>
          <MnemonicNumber>{i + 1}</MnemonicNumber>
          <MnemonicWord>{w}</MnemonicWord>
        </MnemonicWordContainer>
      ))

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
      <PanelTitle color="primary" onBackButtonClick={handleBackPress}>
        {t('Your Wallet')}
      </PanelTitle>
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
        <Button onClick={handleNextPress}>{t("I've copied the words, continue")}</Button>
      </FooterActionsContainer>
    </FloatingPanel>
  )
}

export default WalletWordsPage

const Label = styled.label`
  width: 100%;
  padding-left: var(--spacing-3);
  padding-bottom: var(--spacing-1);
  color: ${({ theme }) => theme.font.secondary};
  font-weight: var(--fontWeight-medium);
`

const WordsContent = styled(Section)`
  justify-content: flex-start;
`

const PhraseBox = styled.div`
  display: flex;
  width: 100%;
  padding: var(--spacing-4);
  color: ${({ theme }) => theme.font.contrastPrimary};
  font-weight: var(--fontWeight-medium);
  background-color: ${({ theme }) => colord(theme.global.alert).alpha(0.4).toRgbString()};
  border: 1px solid ${({ theme }) => theme.global.alert};
  border-radius: var(--radius-small);
  margin-bottom: var(--spacing-4);
  flex-wrap: wrap;
`

const MnemonicWordContainer = styled.div`
  margin: 6px;
  border-radius: var(--radius-tiny);
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadow.primary};
`

const MnemonicNumber = styled.div`
  display: inline-block;
  padding: var(--spacing-1);
  border-right: 1px ${({ theme }) => theme.bg.secondary};
  background-color: ${({ theme }) =>
    theme.name === 'light'
      ? colord(theme.bg.primary).alpha(0.4).toRgbString()
      : colord(theme.bg.contrast).alpha(0.4).toRgbString()};
  color: ${({ theme }) => theme.font.primary};
`

const MnemonicWord = styled.div`
  display: inline-block;
  background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.primary : theme.bg.contrast)};
  color: ${({ theme }) => (theme.name === 'light' ? theme.font.primary : theme.font.contrastSecondary)};
  padding: var(--spacing-1) 8px;
  font-weight: var(--fontWeight-semiBold);
`
