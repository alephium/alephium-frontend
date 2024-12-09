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
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import { ModalContent } from '~/features/modals/ModalContent'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

interface WalletConnectErrorModalProps {
  onClose?: () => void
}

const WalletConnectErrorModal = withModal<WalletConnectErrorModalProps>(({ id, onClose }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const walletConnectClientError = useAppSelector((s) => s.clients.walletConnect.errorMessage)
  const { resetWalletConnectClientInitializationAttempts } = useWalletConnectContext()

  const handleClose = () => {
    onClose && onClose()
    dispatch(closeModal({ id }))
  }

  return (
    <BottomModal modalId={id}>
      <ModalContent verticalGap>
        <ScreenSection>
          <ModalScreenTitle>{t('Could not connect to WalletConnect')}</ModalScreenTitle>
        </ScreenSection>
        {walletConnectClientError && (
          <ScreenSection>
            <Surface>
              <AppTextStyled>{walletConnectClientError}</AppTextStyled>
            </Surface>
          </ScreenSection>
        )}
        <ScreenSection centered>
          <ButtonsRow>
            <Button title={t('Close')} onPress={handleClose} flex />
            <Button
              title={t('Retry')}
              variant="accent"
              onPress={() => {
                resetWalletConnectClientInitializationAttempts()
                dispatch(closeModal({ id }))
              }}
              flex
            />
          </ButtonsRow>
        </ScreenSection>
      </ModalContent>
    </BottomModal>
  )
})

export default WalletConnectErrorModal

const AppTextStyled = styled(AppText)`
  font-family: monospace;
  padding: 10px;
`
