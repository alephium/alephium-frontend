import { useTranslation } from 'react-i18next'

import BottomModal2 from '~/features/modals/BottomModal2'
import withModal from '~/features/modals/withModal'
import ReceiveQRCodeSection from '~/features/receive/ReceiveQRCodeSection'

interface ReceiveQRCodeModalProps {
  addressHash: string
}

const ReceiveQRCodeModal = withModal<ReceiveQRCodeModalProps>(({ id, addressHash }) => {
  const { t } = useTranslation()

  return (
    <BottomModal2 notScrollable modalId={id} title={t('Receive')}>
      <ReceiveQRCodeSection addressHash={addressHash} />
    </BottomModal2>
  )
})

export default ReceiveQRCodeModal
