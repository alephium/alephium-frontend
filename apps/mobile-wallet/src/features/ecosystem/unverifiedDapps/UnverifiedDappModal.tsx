import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import BottomModal from '~/features/modals/BottomModal'
import { useModalContext } from '~/features/modals/ModalContext'
import { VERTICAL_GAP } from '~/style/globalStyle'

export interface UnverifiedDappModalProps {
  dAppHost: string
  onConfirm: () => void
}

const UnverifiedDappModal = memo<UnverifiedDappModalProps>(({ dAppHost, onConfirm }) => {
  const { t } = useTranslation()
  const { dismissModal, onUserDismiss } = useModalContext()

  const handleConfirm = () => {
    dismissModal()
    onConfirm()
  }

  const handleCancel = () => {
    onUserDismiss?.()
    dismissModal()
  }

  return (
    <BottomModal notScrollable title={`⚠️ ${t('Are you sure?')}`} noPadding>
      <ScreenSection verticalGap>
        <AppText color="secondary" size={18} style={{ textAlign: 'center', paddingTop: VERTICAL_GAP }}>
          {t('This dApp ({{ dAppHost }}) is not in the Alephium dApp list. Only continue if you trust it.', {
            dAppHost
          })}
        </AppText>
        <BottomButtons fullWidth backgroundColor="back1" bottomInset>
          <Button title={t('Cancel')} onPress={handleCancel} flex />
          <Button title={t('Continue anyway')} onPress={handleConfirm} variant="alert" flex />
        </BottomButtons>
      </ScreenSection>
    </BottomModal>
  )
})

export default UnverifiedDappModal
