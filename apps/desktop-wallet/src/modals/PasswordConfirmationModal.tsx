import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import PasswordConfirmation from '@/components/PasswordConfirmation'
import { ModalBaseProp } from '@/features/modals/modalTypes'

import CenteredModal from './CenteredModal'

export interface PasswordConfirmationModalProps {
  onCorrectPasswordEntered: () => void
}

const PasswordConfirmationModal = memo(
  ({ onCorrectPasswordEntered, id }: PasswordConfirmationModalProps & ModalBaseProp) => {
    const { t } = useTranslation()

    return (
      <CenteredModal id={id}>
        <PasswordConfirmation buttonText={t('Confirm')} onCorrectPasswordEntered={onCorrectPasswordEntered} />
      </CenteredModal>
    )
  }
)

export default PasswordConfirmationModal
