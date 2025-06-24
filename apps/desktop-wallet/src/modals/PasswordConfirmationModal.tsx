import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

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
        <PasswordConfirmation
          text={t('Enter your password to send the transaction.')}
          buttonText={t('Send')}
          onCorrectPasswordEntered={onCorrectPasswordEntered}
          highlightButton
        />
        <PasswordConfirmationNote>
          {t('You can disable this confirmation step from the wallet settings.')}
        </PasswordConfirmationNote>
      </CenteredModal>
    )
  }
)

export default PasswordConfirmationModal

const PasswordConfirmationNote = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
`
