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

import { encryptMnemonic } from '@alephium/keyring'
import { getHumanReadableError } from '@alephium/shared'
import { AlertCircle } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import zxcvbn from 'zxcvbn'

import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import Input from '@/components/Inputs/Input'
import {
  FloatingPanel,
  FooterActionsContainer,
  PanelContentContainer,
  Section
} from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import Paragraph from '@/components/Paragraph'
import { useStepsContext } from '@/contexts/steps'
import { useWalletContext } from '@/contexts/wallet'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import { selectDevModeStatus } from '@/storage/global/globalSlice'
import { walletCreationFailed } from '@/storage/wallets/walletActions'
import { saveNewWallet } from '@/storage/wallets/walletStorageUtils'
import { isWalletNameValid } from '@/utils/form-validation'

const CreateWalletPage = ({ isRestoring = false }: { isRestoring?: boolean }) => {
  const { t } = useTranslation()
  const { onButtonBack, onButtonNext } = useStepsContext()
  const devMode = useAppSelector(selectDevModeStatus)
  const dispatch = useAppDispatch()
  const posthog = usePostHog()
  const { discoverAndSaveUsedAddresses } = useAddressGeneration()
  const { mnemonic, setMnemonic } = useWalletContext()

  const [walletName, setWalletNameState] = useState('')
  const [walletNameError, setWalletNameError] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordCheck, setPasswordCheck] = useState('')

  useEffect(() => {
    if (!password && !!passwordCheck) setPasswordCheck('')
  }, [password, passwordCheck])

  if (!mnemonic) return null

  const onUpdatePassword = (password: string): void => {
    let passwordError = ''

    if (password.length && !devMode) {
      const strength = zxcvbn(password)
      if (strength.score < 1) {
        passwordError = t`Password is too weak`
      } else if (strength.score < 3) {
        passwordError = t`Insecure password`
      }
    }

    setPassword(password)
    setPasswordError(passwordError)
  }

  const onUpdateWalletName = (walletName: string) => {
    const isValidOrError = devMode || isWalletNameValid({ name: walletName })

    setWalletNameState(walletName)
    setWalletNameError(isValidOrError !== true ? isValidOrError : '')
  }

  const handleNextButtonClick = () => {
    try {
      saveNewWallet({ walletName, encrypted: encryptMnemonic(mnemonic, password) })
      setMnemonic(null)

      if (isRestoring) {
        discoverAndSaveUsedAddresses({ skipIndexes: [0], enableLoading: false })
        posthog.capture('New wallet imported', { wallet_name_length: walletName.length })
      } else {
        posthog.capture('New wallet created', { wallet_name_length: walletName.length })
      }

      onButtonNext()
    } catch (e) {
      console.error(e)

      if (isRestoring) {
        dispatch(walletCreationFailed(getHumanReadableError(e, t('Error while importing wallet'))))
        posthog.capture('Error', { message: 'Could not import wallet' })
      } else {
        dispatch(
          walletCreationFailed(getHumanReadableError(e, t('Something went wrong when creating encrypted wallet.')))
        )
        posthog.capture('Error', { message: 'Could not create wallet' })
      }
    } finally {
      setPassword('')
      setPasswordCheck('')
    }
  }

  const isNextButtonActive =
    password.length > 0 &&
    passwordError.length === 0 &&
    password === passwordCheck &&
    walletName.length > 0 &&
    walletNameError.length === 0

  return (
    <FloatingPanel>
      <PanelTitle color="primary">{isRestoring ? t('Import wallet') : t('New wallet')}</PanelTitle>
      <PanelContentContainer>
        <Section inList>
          <Input
            value={walletName}
            label={isRestoring ? t('New wallet name') : t('Wallet name')}
            onChange={(e) => onUpdateWalletName(e.target.value)}
            error={walletNameError}
            isValid={walletName.length > 0 && walletNameError.length === 0}
          />
          <Input
            value={password}
            label={isRestoring ? t('New password') : t('Password')}
            type="password"
            onChange={(e) => onUpdatePassword(e.target.value)}
            error={passwordError}
            isValid={!passwordError && password.length > 0}
          />
          <Input
            value={passwordCheck}
            label={t('Retype password')}
            type="password"
            onChange={(e) => setPasswordCheck(e.target.value)}
            error={passwordCheck && password !== passwordCheck ? t('Passwords are different') : ''}
            isValid={password.length > 0 && password === passwordCheck}
            disabled={!password || passwordError.length > 0}
          />
          <InfoBox
            Icon={AlertCircle}
            importance="warning"
            text={t('Make sure to keep your password secured as it cannot be changed in the future.')}
          />
          <WarningNote>{t("Alephium doesn't have access to your wallet.\nYou are the only owner.")}</WarningNote>
        </Section>
      </PanelContentContainer>
      <FooterActionsContainer>
        <Button role="secondary" onClick={onButtonBack}>
          {t('Back')}
        </Button>
        <Button disabled={!isNextButtonActive} onClick={handleNextButtonClick}>
          {t('Continue')}
        </Button>
      </FooterActionsContainer>
    </FloatingPanel>
  )
}

export default CreateWalletPage

const WarningNote = styled(Paragraph)`
  text-align: center;
  color: ${({ theme }) => theme.font.secondary};
  margin-bottom: 0;
`
