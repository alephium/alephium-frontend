import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import BottomModal2 from '~/features/modals/BottomModal2'
import ReceiveQRCodeSection from '~/features/receive/ReceiveQRCodeSection'

interface ReceiveQRCodeModalProps {
  addressHash: string
}

const ReceiveQRCodeModal = memo<ReceiveQRCodeModalProps>(({ addressHash }) => {
  const { t } = useTranslation()

  return (
    <BottomModal2 notScrollable title={t('Receive')}>
      <ReceiveQRCodeSection addressHash={addressHash} />
    </BottomModal2>
  )
})

export default ReceiveQRCodeModal
