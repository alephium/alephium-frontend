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
  background-color: ${({ theme }) => colord(theme.global.alert).alpha(0.1).toRgbString()};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
  margin-bottom: var(--spacing-4);
  flex-wrap: wrap;
`

const MnemonicWordContainer = styled.div`
  margin: 6px;
  border-radius: var(--radius-small);
  overflow: hidden;
`

const MnemonicNumber = styled.div`
  display: inline-block;
  padding: var(--spacing-1);
  border-right: 1px ${({ theme }) => theme.bg.secondary};
  background-color: ${({ theme }) =>
    theme.name === 'light'
      ? colord(theme.font.primary).alpha(0.8).toRgbString()
      : colord(theme.font.contrastPrimary).alpha(0.8).toRgbString()};
  color: ${({ theme }) => (theme.name === 'light' ? theme.font.contrastPrimary : theme.font.primary)};
`

const MnemonicWord = styled.div`
  display: inline-block;
  background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.primary : theme.bg.contrast)};
  color: ${({ theme }) => (theme.name === 'light' ? theme.font.primary : theme.font.contrastSecondary)};
  padding: var(--spacing-1) 8px;
  font-weight: var(--fontWeight-semiBold);
`
