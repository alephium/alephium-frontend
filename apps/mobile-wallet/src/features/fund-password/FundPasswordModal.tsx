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
import { Platform } from 'react-native'
import { Portal } from 'react-native-portalize'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import BottomModal, { BottomModalProps } from '~/components/layout/BottomModal'
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import useFundPassword from '~/features/fund-password/useFundPassword'
import { useAppSelector } from '~/hooks/redux'
import usePassword from '~/hooks/usePassword'

export interface FundPasswordModalProps extends Pick<BottomModalProps, 'isOpen' | 'onClose'> {
  successCallback: () => void
}

const FundPasswordModal = ({ successCallback, ...props }: FundPasswordModalProps) => {
  const isUsingFundPassword = useAppSelector((s) => s.fundPassword.isActive)

  if (!isUsingFundPassword) return null

  return (
    <Portal>
      <BottomModal
        {...props}
        maximisedContent={Platform.OS === 'ios'}
        Content={(props) => <FundPasswordModalContent successCallback={successCallback} {...props} />}
      />
    </Portal>
  )
}

export default FundPasswordModal

const FundPasswordModalContent = ({
  successCallback,
  ...props
}: ModalContentProps & Pick<FundPasswordModalProps, 'successCallback'>) => {
  const fundPassword = useFundPassword()
  const { password, handlePasswordChange, isPasswordCorrect, error } = usePassword({
    correctPassword: fundPassword ?? '',
    errorMessage: 'Provided fund password is wrong'
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
      props.onClose && props.onClose()
    } else {
      setDisplayedError(error)
    }
  }

  return (
    <ModalContent verticalGap {...props}>
      <ScreenSection>
        <BottomModalScreenTitle>Fund password</BottomModalScreenTitle>
      </ScreenSection>
      <ScreenSection>
        <AppText color="secondary" size={18}>
          Please, enter your fund password.
        </AppText>
      </ScreenSection>
      <ScreenSection>
        <Input
          label="Fund password"
          value={password}
          onChangeText={handleFundPasswordChange}
          secureTextEntry
          autoCapitalize="none"
          returnKeyType="done"
          blurOnSubmit={false}
          error={displayedError}
        />
      </ScreenSection>
      <ScreenSection>
        <Button title="Submit" variant="highlight" onPress={handleSubmit} disabled={password.length === 0} />
      </ScreenSection>
    </ModalContent>
  )
}
