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
