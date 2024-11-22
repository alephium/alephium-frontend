import InfoBox from '@/components/InfoBox'
import { Section } from '@/components/PageComponents/PageContainers'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal from '@/modals/CenteredModal'
import { useTranslation } from 'react-i18next'
import { AlertOctagon } from 'lucide-react'

const ZeroBalanceWarnModal = ({ id }: ModalBaseProp) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleClose = () => {
    dispatch(closeModal({ id }))
  }

  return (
    <CenteredModal id={id} title={t('Zero Balance Warning')} onClose={handleClose}>
      <Section>
        <InfoBox
          text={t('Your balance is zero. Cannot proceed sent request.')}
          Icon={AlertOctagon}
          importance="alert"
        />
      </Section>
    </CenteredModal>
  )
}

export default ZeroBalanceWarnModal
