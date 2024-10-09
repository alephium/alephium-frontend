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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import useFundPassword from '~/features/fund-password/useFundPassword'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import { ModalContent } from '~/features/modals/ModalContent'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import usePassword from '~/hooks/usePassword'

export interface FundPasswordModalProps {
  successCallback: () => void
}

const FundPasswordModal = withModal<FundPasswordModalProps>(({ id, successCallback }) => {
  const isUsingFundPassword = useAppSelector((s) => s.fundPassword.isActive)

  if (!isUsingFundPassword) return null

  const fundPassword = useFundPassword()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { password, handlePasswordChange, isPasswordCorrect, error } = usePassword({
    correctPassword: fundPassword ?? '',
    errorMessage: t('Provided fund password is wrong')
  })
  const [displayedError, setDisplayedError] = useState<string | undefined>()

  if (!fundPassword) return null

  const handleFundPasswordChange = (text: string) => {
    handlePasswordChange(text)
    setDisplayedError(undefined)
  }

  const handleSubmit = () => {
    if (isPasswordCorrect) {
      successCallback()
      dispatch(closeModal({ id }))
    } else {
      setDisplayedError(error)
    }
  }

  return (
    <BottomModal id={id}>
      <ModalContent verticalGap>
        <ScreenSection>
          <ModalScreenTitle>{t('Fund password')}</ModalScreenTitle>
        </ScreenSection>
        <ScreenSection>
          <AppText color="secondary" size={18}>
            {t('Please, enter your fund password.')}
          </AppText>
        </ScreenSection>
        <ScreenSection>
          <Input
            label={t('Fund password')}
            value={password}
            onChangeText={handleFundPasswordChange}
            onSubmitEditing={handleSubmit}
            secureTextEntry
            autoCapitalize="none"
            blurOnSubmit={false}
            error={displayedError}
          />
        </ScreenSection>
        <ScreenSection>
          <Button title={t('Submit')} variant="highlight" onPress={handleSubmit} disabled={password.length === 0} />
        </ScreenSection>
      </ModalContent>
    </BottomModal>
  )
})

export default FundPasswordModal
