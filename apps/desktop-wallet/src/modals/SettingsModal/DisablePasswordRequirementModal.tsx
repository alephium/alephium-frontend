import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import PasswordConfirmation from '@/components/PasswordConfirmation'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { passwordRequirementToggled } from '@/features/settings/settingsActions'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal, { CenteredModalProps } from '@/modals/CenteredModal'

export type DisablePasswordRequirementModalProps = Pick<CenteredModalProps, 'focusMode'>

const DisablePasswordRequirementModal = memo(
  ({ id, ...props }: ModalBaseProp & DisablePasswordRequirementModalProps) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const { sendAnalytics } = useAnalytics()

    const disablePasswordRequirement = () => {
      dispatch(passwordRequirementToggled())
      dispatch(closeModal({ id }))

      sendAnalytics({ event: 'Disabled password requirement' })
    }

    return (
      <CenteredModal title={t('Password')} id={id} skipFocusOnMount hasFooterButtons dynamicContent {...props}>
        <PasswordConfirmation
          text={t('Type your password to change this setting.')}
          buttonText={t('Enter')}
          onCorrectPasswordEntered={disablePasswordRequirement}
        />
      </CenteredModal>
    )
  }
)

export default DisablePasswordRequirementModal
