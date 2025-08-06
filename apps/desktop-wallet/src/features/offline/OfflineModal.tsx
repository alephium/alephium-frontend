import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { ModalBaseProp } from '@/features/modals/modalTypes'
import OfflineMessage from '@/features/offline/OfflineMessage'
import CenteredModal from '@/modals/CenteredModal'

const OfflineModal = memo(({ id }: ModalBaseProp) => {
  const { t } = useTranslation()

  return (
    <CenteredModal title={t('Degraded experience')} id={id} noPadding>
      <OfflineMessage />
    </CenteredModal>
  )
})

export default OfflineModal
