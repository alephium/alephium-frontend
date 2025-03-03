import { decryptMnemonic } from '@alephium/keyring'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Input from '@/components/Inputs/Input'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
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
  onBack?: () => void
}

const PasswordConfirmation = ({
  text,
  buttonText,
  onCorrectPasswordEntered,
  walletId,
  isSubmitDisabled = false,
  highlightButton = false,
  children,
  onBack
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
      <Input value={password} label={text} type="password" onChange={(e) => setPassword(e.target.value)} autoFocus />

      {children && <Children>{children}</Children>}

      <ModalFooterButtons>
        {onBack && (
          <ModalFooterButton role="secondary" onClick={onBack}>
            {t('Back')}
          </ModalFooterButton>
        )}
        <ModalFooterButton
          onClick={validatePassword}
          submit
          disabled={isSubmitDisabled || !password}
          variant={highlightButton ? 'valid' : 'default'}
          wide
          justifyContent="center"
          squared
        >
          {buttonText || t('Submit')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </>
  )
}

export default PasswordConfirmation

const Children = styled.div`
  width: 100%;
`
