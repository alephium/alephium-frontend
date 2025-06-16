import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface BiometricsWarningModalProps {
  onConfirm: () => void
  confirmText?: string
}

const BiometricsWarningModal = memo<BiometricsWarningModalProps & ModalBaseProp>(({ onConfirm, confirmText }) => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()

  const handleConfirm = () => {
    onConfirm()
    dismissModal()
  }

  const handleCancel = () => {
    dismissModal()
  }

  return (
    <BottomModal2 notScrollable title={`⚠️ ${t('Are you sure?')}`} noPadding>
      <ScreenSection verticalGap>
        <AppText color="secondary" size={18} style={{ textAlign: 'center', paddingTop: VERTICAL_GAP }}>
          {t(
            "If you don't turn on biometrics, anyone who gains access to your device can open the app and steal your funds."
          )}
        </AppText>
        <BottomButtons fullWidth backgroundColor="back1" bottomInset>
          <Button title={t('Cancel')} onPress={handleCancel} flex />
          <Button title={confirmText ?? t('Disable')} onPress={handleConfirm} variant="alert" flex />
        </BottomButtons>
      </ScreenSection>
    </BottomModal2>
  )
})

export default BiometricsWarningModal
