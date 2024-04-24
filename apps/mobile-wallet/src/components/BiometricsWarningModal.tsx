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

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'

interface BiometricsWarningModalProps extends ModalContentProps {
  onConfirm: () => void
  confirmText?: string
}

const BiometricsWarningModal = ({ onConfirm, confirmText, ...props }: BiometricsWarningModalProps) => (
  <ModalContent verticalGap {...props}>
    <ScreenSection>
      <BottomModalScreenTitle>⚠️ Are you sure?</BottomModalScreenTitle>
    </ScreenSection>
    <ScreenSection>
      <AppText color="secondary" size={18}>
        If you don't turn on biometrics, anyone who gains access to your device can open the app and steal your funds.
      </AppText>
    </ScreenSection>
    <ScreenSection centered>
      <ButtonsRow>
        <Button title="Cancel" onPress={props.onClose} flex short />
        <Button title={confirmText || 'Disable'} onPress={onConfirm} variant="alert" flex short />
      </ButtonsRow>
    </ScreenSection>
  </ModalContent>
)

export default BiometricsWarningModal
