/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import PasswordConfirmation from '@/components/PasswordConfirmation'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal, { CenteredModalProps } from '@/modals/CenteredModal'
import { passwordRequirementToggled } from '@/features/settings/settingsActions'

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
      <CenteredModal title={t('Password')} id={id} skipFocusOnMount {...props}>
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
