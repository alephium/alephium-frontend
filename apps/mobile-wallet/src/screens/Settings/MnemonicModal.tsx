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

import { usePreventScreenCapture } from 'expo-screen-capture'

import Button from '~/components/buttons/Button'
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { ScreenSection } from '~/components/layout/Screen'
import { useAppSelector } from '~/hooks/redux'
import OrderedTable from '~/screens/Settings/OrderedTable'

interface MnemonicModalProps extends ModalContentProps {
  onVerifyButtonPress?: () => void
}

const MnemonicModal = ({ onVerifyButtonPress, ...props }: MnemonicModalProps) => {
  const mnemonic = useAppSelector((s) => s.wallet.mnemonic)

  usePreventScreenCapture()

  return (
    <ModalContent verticalGap {...props}>
      <ScreenSection fill>
        <OrderedTable items={mnemonic ? mnemonic.split(' ') : []} />
      </ScreenSection>
      {onVerifyButtonPress && (
        <ScreenSection>
          <Button variant="highlight" title="Verify" onPress={onVerifyButtonPress} />
        </ScreenSection>
      )}
    </ModalContent>
  )
}

export default MnemonicModal
