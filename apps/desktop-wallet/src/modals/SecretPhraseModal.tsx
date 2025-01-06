import { dangerouslyConvertUint8ArrayMnemonicToString, decryptMnemonic } from '@alephium/keyring'
import { resetArray } from '@alephium/shared'
import { Edit3 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import InfoBox from '@/components/InfoBox'
import { Section } from '@/components/PageComponents/PageContainers'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal from '@/modals/CenteredModal'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'

const SecretPhraseModal = ({ id }: ModalBaseProp) => {
  const { t } = useTranslation()
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)
  const [isDisplayingPhrase, setIsDisplayingPhrase] = useState(false)
  const [mnemonic, setMnemonic] = useState<string>()
  const dispatch = useAppDispatch()

  if (!activeWalletId) return null

  const handleCorrectPasswordEntered = async (password: string) => {
    try {
      const { decryptedMnemonic } = await decryptMnemonic(walletStorage.load(activeWalletId).encrypted, password)
      setMnemonic(dangerouslyConvertUint8ArrayMnemonicToString(decryptedMnemonic))
      resetArray(decryptedMnemonic)
      setIsDisplayingPhrase(true)
    } catch (e) {
      console.error(e)
    } finally {
      password = ''
    }
  }

  const handleClose = () => {
    setMnemonic('')
    dispatch(closeModal({ id }))
  }

  return (
    <CenteredModal
      id={id}
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

export default SecretPhraseModal

const PhraseBox = styled.div`
  width: 100%;
  padding: var(--spacing-4);
  color: ${({ theme }) => theme.font.contrastPrimary};
  font-weight: var(--fontWeight-semiBold);
  background-color: ${({ theme }) => theme.global.alert};
  border-radius: var(--radius-small);
  margin-bottom: var(--spacing-4);
`
