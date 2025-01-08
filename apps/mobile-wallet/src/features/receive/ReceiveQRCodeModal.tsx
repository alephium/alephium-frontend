import { useTranslation } from 'react-i18next'

import BottomModal from '~/features/modals/BottomModal'
import withModal from '~/features/modals/withModal'
import ReceiveQRCodeSection from '~/features/receive/ReceiveQRCodeSection'

interface ReceiveQRCodeModalProps {
  addressHash: string
}

const ReceiveQRCodeModal = withModal<ReceiveQRCodeModalProps>(({ id, addressHash }) => {
  const { t } = useTranslation()

  return (
    <BottomModal modalId={id} title={t('Receive')}>
      <ReceiveQRCodeSection addressHash={addressHash} />
    </BottomModal>
  )
})

export default ReceiveQRCodeModal
