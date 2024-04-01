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

import { dangerouslyConvertUint8ArrayMnemonicToString, decryptMnemonic } from '@alephium/shared-crypto'
import { Edit3 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import InfoBox from '@/components/InfoBox'
import { Section } from '@/components/PageComponents/PageContainers'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import { useAppSelector } from '@/hooks/redux'
import CenteredModal from '@/modals/CenteredModal'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'

const SecretPhraseModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation()
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)
  const [isDisplayingPhrase, setIsDisplayingPhrase] = useState(false)
  const [mnemonic, setMnemonic] = useState<string>()

  if (!activeWalletId) return null

  const handleCorrectPasswordEntered = (password: string) => {
    try {
      setMnemonic(
        dangerouslyConvertUint8ArrayMnemonicToString(
          decryptMnemonic(walletStorage.load(activeWalletId).encrypted, password).decryptedMnemonic
        )
      )
      setIsDisplayingPhrase(true)
    } catch (e) {
      console.error(e)
    } finally {
      password = ''
    }
  }

  const handleClose = () => {
    setMnemonic('')
    onClose()
  }

  return (
    <CenteredModal
      title={t('Secret recovery phrase')}
      onClose={handleClose}
      focusMode
      narrow={!isDisplayingPhrase}
      skipFocusOnMount
    >
      {!isDisplayingPhrase ? (
        <div>
          <PasswordConfirmation
            text={t('Type your password to show the phrase.')}
            buttonText={t('Show')}
            onCorrectPasswordEntered={handleCorrectPasswordEntered}
          />
        </div>
      ) : (
        <Section>
          <InfoBox
            text={t("Carefully note down the words! They are your wallet's secret recovery phrase.")}
            Icon={Edit3}
            importance="alert"
          />
          <PhraseBox>{mnemonic}</PhraseBox>
        </Section>
      )}
    </CenteredModal>
  )
}

const PhraseBox = styled.div`
  width: 100%;
  padding: var(--spacing-4);
  color: ${({ theme }) => theme.font.contrastPrimary};
  font-weight: var(--fontWeight-semiBold);
  background-color: ${({ theme }) => theme.global.alert};
  border-radius: var(--radius-small);
  margin-bottom: var(--spacing-4);
`

export default SecretPhraseModal
