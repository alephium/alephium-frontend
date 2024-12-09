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

import { decryptMnemonic } from '@alephium/keyring'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import Input from '@/components/Inputs/Input'
import { Section } from '@/components/PageComponents/PageContainers'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { passwordValidationFailed } from '@/storage/auth/authActions'
import { walletStorage } from '@/storage/wallets/walletPersistentStorage'

export interface PasswordConfirmationProps {
  onCorrectPasswordEntered: (password: string) => void
  isSubmitDisabled?: boolean
  text?: string
  buttonText?: string
  highlightButton?: boolean
  walletId?: string
  children?: ReactNode
}

const PasswordConfirmation = ({
  text,
  buttonText,
  onCorrectPasswordEntered,
  walletId,
  isSubmitDisabled = false,
  highlightButton = false,
  children
}: PasswordConfirmationProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeWallet = useAppSelector((state) => state.activeWallet)

  const [password, setPassword] = useState('')

  const storedWalletId = walletId || activeWallet.id

  if (!storedWalletId) return null

  const validatePassword = async () => {
    try {
      await decryptMnemonic(walletStorage.load(storedWalletId).encrypted, password)
      onCorrectPasswordEntered(password)
    } catch (e) {
      console.error(e)
      dispatch(passwordValidationFailed())
    } finally {
      setPassword('')
    }
  }

  return (
    <>
      <Section>
        <Input value={password} label={text} type="password" onChange={(e) => setPassword(e.target.value)} autoFocus />
        {children && <Children>{children}</Children>}
      </Section>
      <Section>
        <ButtonStyled
          onClick={validatePassword}
          submit
          disabled={isSubmitDisabled || !password}
          variant={highlightButton ? 'valid' : 'default'}
        >
          {buttonText || t('Submit')}
        </ButtonStyled>
      </Section>
    </>
  )
}

export default PasswordConfirmation

const Children = styled.div`
  width: 100%;
`

const ButtonStyled = styled(Button)`
  margin-top: var(--spacing-4);
`
