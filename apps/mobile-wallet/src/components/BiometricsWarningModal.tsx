import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import { ModalContent } from '~/features/modals/ModalContent'
import withModal from '~/features/modals/withModal'
import { useAppDispatch } from '~/hooks/redux'

interface BiometricsWarningModalProps {
  onConfirm: () => void
  confirmText?: string
}

const BiometricsWarningModal = withModal<BiometricsWarningModalProps>(({ id, onConfirm, confirmText }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleConfirm = () => {
    onConfirm()
    dispatch(closeModal({ id }))
  }

  return (
    <BottomModal modalId={id}>
      <ModalContent verticalGap>
        <ScreenSection>
          <ModalScreenTitle>⚠️ {t('Are you sure?')}</ModalScreenTitle>
        </ScreenSection>
        <ScreenSection>
          <AppText color="secondary" size={18}>
            {t(
              "If you don't turn on biometrics, anyone who gains access to your device can open the app and steal your funds."
            )}
          </AppText>
        </ScreenSection>
        <ScreenSection centered>
          <ButtonsRow>
            <Button title={t('Cancel')} onPress={() => dispatch(closeModal({ id }))} flex short />
            <Button title={confirmText ?? t('Disable')} onPress={handleConfirm} variant="alert" flex short />
          </ButtonsRow>
        </ScreenSection>
      </ModalContent>
    </BottomModal>
  )
})

export default BiometricsWarningModal
