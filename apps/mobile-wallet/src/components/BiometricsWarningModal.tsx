import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import BottomModal2 from '~/features/modals/BottomModal2'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch } from '~/hooks/redux'
import { VERTICAL_GAP } from '~/style/globalStyle'

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
    <BottomModal2 notScrollable modalId={id} title={`⚠️ ${t('Are you sure?')}`} noPadding>
      <ScreenSection verticalGap>
        <AppText color="secondary" size={18} style={{ textAlign: 'center', paddingTop: VERTICAL_GAP }}>
          {t(
            "If you don't turn on biometrics, anyone who gains access to your device can open the app and steal your funds."
          )}
        </AppText>
        <BottomButtons fullWidth backgroundColor="back1" bottomInset>
          <Button title={t('Cancel')} onPress={() => dispatch(closeModal({ id }))} flex />
          <Button title={confirmText ?? t('Disable')} onPress={handleConfirm} variant="alert" flex />
        </BottomButtons>
      </ScreenSection>
    </BottomModal2>
  )
})

export default BiometricsWarningModal
