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

import { LucideIcon } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import InfoBox from '@/components/InfoBox'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal, { CenteredModalProps, ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'

export interface ConfirmModalProps extends Pick<CenteredModalProps, 'narrow'> {
  Icon?: LucideIcon
  onConfirm: () => void
  text: string
}

const ConfirmModal = memo(({ onConfirm, Icon, text, id, ...props }: ModalBaseProp & ConfirmModalProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const onClose = () => dispatch(closeModal({ id }))

  const handleConfirmPress = () => {
    onConfirm()
    onClose()
  }

  return (
    <CenteredModal title={t('Confirm')} id={id} {...props}>
      <InfoBox Icon={Icon}>{text}</InfoBox>
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={onClose}>
          {t('Cancel')}
        </ModalFooterButton>
        <ModalFooterButton onClick={handleConfirmPress}>{t('Confirm')}</ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
})

export default ConfirmModal
