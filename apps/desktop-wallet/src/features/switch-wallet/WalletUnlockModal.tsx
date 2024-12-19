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

import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import WalletPassphrase from '@/components/Inputs/WalletPassphrase'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
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

  const [passphrase, setPassphrase] = useState('')
  const [isPassphraseConfirmed, setIsPassphraseConfirmed] = useState(false)
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
        isSubmitDisabled={!isPassphraseConfirmed}
      >
        <WalletPassphraseStyled
          onPassphraseConfirmed={setPassphrase}
          setIsPassphraseConfirmed={setIsPassphraseConfirmed}
        />
      </PasswordConfirmation>
    </CenteredModal>
  )
})

export default WalletUnlockModal

const WalletPassphraseStyled = styled(WalletPassphrase)`
  margin: 10px 0;
  width: 100%;
`
