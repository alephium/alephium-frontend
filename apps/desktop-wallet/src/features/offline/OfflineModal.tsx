import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ModalBaseProp } from '@/features/modals/modalTypes'
import OfflineMessage from '@/features/offline/OfflineMessage'
import CenteredModal from '@/modals/CenteredModal'

const OfflineModal = memo(({ id }: ModalBaseProp) => {
  const { t } = useTranslation()

  return (
    <CenteredModal title={t('Degraded experience')} id={id} noPadding>
      <OfflineMessageContainer>
        <OfflineMessage />
      </OfflineMessageContainer>
    </CenteredModal>
  )
})

export default OfflineModal

const OfflineMessageContainer = styled.div`
  padding: 50px var(--spacing-2) var(--spacing-2) var(--spacing-2);
`
