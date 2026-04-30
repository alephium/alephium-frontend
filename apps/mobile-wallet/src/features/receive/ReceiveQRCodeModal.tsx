import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import BottomModal from '~/features/modals/BottomModal'
import ReceiveQRCodeSection from '~/features/receive/ReceiveQRCodeSection'

interface ReceiveQRCodeModalProps {
  addressHash: string
}

const ReceiveQRCodeModal = memo<ReceiveQRCodeModalProps>(({ addressHash }) => {
  const { t } = useTranslation()

  return (
    <BottomModal notScrollable title={t('Receive')}>
      <ReceiveQRCodeSection addressHash={addressHash} />
    </BottomModal>
  )
})

export default ReceiveQRCodeModal
