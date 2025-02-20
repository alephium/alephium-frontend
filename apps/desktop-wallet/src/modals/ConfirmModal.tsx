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
  note?: string
}

const ConfirmModal = memo(({ onConfirm, Icon, text, note, id, ...props }: ModalBaseProp & ConfirmModalProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const onClose = () => dispatch(closeModal({ id }))

  const handleConfirmPress = () => {
    onConfirm()
    onClose()
  }

  return (
    <CenteredModal title={t('Confirm')} id={id} hasFooterButtons dynamicContent {...props}>
      <InfoBox Icon={Icon}>{text}</InfoBox>

      {note && <InfoBox importance="accent">{note}</InfoBox>}

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
