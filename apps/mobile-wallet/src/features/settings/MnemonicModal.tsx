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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import { ModalContent } from '~/features/modals/ModalContent'
import withModal from '~/features/modals/withModal'
import OrderedTable from '~/features/settings/OrderedTable'
import { useAppDispatch } from '~/hooks/redux'
import { dangerouslyExportWalletMnemonic } from '~/persistent-storage/wallet'

interface MnemonicModalProps {
  onVerifyPress?: () => void
}

const MnemonicModal = withModal<MnemonicModalProps>(({ id, onVerifyPress }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const [mnemonic, setMnemonic] = useState<string>()

  useEffect(() => {
    try {
      dangerouslyExportWalletMnemonic().then(setMnemonic)
    } catch (e) {
      console.error(e)
    }
  }, [])

  usePreventScreenCapture()

  const handleVerifyButtonPress = () => {
    onVerifyPress && onVerifyPress()
    dispatch(closeModal({ id }))
  }

  return (
    <BottomModal
      id={id}
      Content={(props) => (
        <ModalContent verticalGap {...props}>
          <ScreenSection fill>
            <OrderedTable items={mnemonic ? mnemonic.split(' ') : []} />
          </ScreenSection>
          {onVerifyPress && (
            <ScreenSection>
              <Button variant="highlight" title={t('Verify')} onPress={handleVerifyButtonPress} />
            </ScreenSection>
          )}
        </ModalContent>
      )}
    />
  )
})

export default MnemonicModal
