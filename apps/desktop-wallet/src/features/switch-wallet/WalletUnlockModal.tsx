import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import PasswordConfirmation from '@/components/PasswordConfirmation'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import usePassphrase from '@/features/passphrase/usePassphrase'
import UsePassphraseButton from '@/features/passphrase/UsePassphraseButton'
import WalletPassphrase from '@/features/passphrase/WalletPassphraseForm'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useWalletLock from '@/hooks/useWalletLock'
import CenteredModal from '@/modals/CenteredModal'

export interface WalletUnlockModalProps {
  walletId: string
}

const WalletUnlockModal = memo(({ id, walletId }: ModalBaseProp & WalletUnlockModalProps) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { unlockWallet } = useWalletLock()
  const { t } = useTranslation()
  const wallets = useAppSelector((s) => s.global.wallets)

  const { passphrase, passphraseConsent, handleUsePassphrasePress, setPassphrase, isPassphraseSubmitEnabled } =
    usePassphrase()

  const [walletName] = useState(wallets.find((wallet) => wallet.id === walletId)?.name)

  const onUnlockClick = (password: string) => {
    dispatch(closeModal({ id }))

    navigate('/')

    unlockWallet({
      event: 'switch',
      walletId,
      password,
      passphrase,
      afterUnlock: () => navigate('/wallet/overview')
    })

    setPassphrase('')
    password = ''
  }

  return (
    <CenteredModal narrow title={t('Enter password')} id={id} skipFocusOnMount>
      <PasswordConfirmation
        text={t('Enter password for "{{ walletName }}"', { walletName })}
        buttonText={t('Unlock')}
        onCorrectPasswordEntered={onUnlockClick}
        walletId={walletId}
        isSubmitDisabled={!isPassphraseSubmitEnabled}
      >
        {passphraseConsent && <WalletPassphraseStyled onPassphraseConfirmed={setPassphrase} />}
        <UsePassphraseButtonStyled
          passphraseConsent={passphraseConsent}
          onConsentChange={handleUsePassphrasePress}
          squared
          wide
          justifyContent="center"
        />
      </PasswordConfirmation>
    </CenteredModal>
  )
})

export default WalletUnlockModal

const WalletPassphraseStyled = styled(WalletPassphrase)`
  width: 100%;
`

const UsePassphraseButtonStyled = styled(UsePassphraseButton)`
  margin-top: var(--spacing-4);
`
