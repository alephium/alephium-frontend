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
  const usesFundPassword = useAppSelector((s) => s.settings.usesFundPassword)

  if (!usesFundPassword) return null

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
  const { password, handlePasswordChange, isPasswordCorrect, error } = usePassword(
    fundPassword ?? '',
    'Provided fund password is wrong'
  )

  if (!fundPassword) return null

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
          onChangeText={handlePasswordChange}
          secureTextEntry
          autoCapitalize="none"
          returnKeyType="done"
          blurOnSubmit={false}
          error={error}
        />
      </ScreenSection>
      <ScreenSection>
        <Button
          title="Submit"
          variant="highlight"
          onPress={() => {
            successCallback()
            props.onClose && props.onClose()
          }}
          disabled={!isPasswordCorrect}
        />
      </ScreenSection>
    </ModalContent>
  )
}
