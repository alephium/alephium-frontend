import { ConnectDappMessageData } from '@alephium/wallet-dapp-provider'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import ConnectDappModalHeader from '~/features/ecosystem/modals/ConnectDappModalHeader'
import ConnectDappNewAddressModalContent from '~/features/ecosystem/modals/ConnectDappNewAddressModalContent'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'

interface ConnectDappNewAddressModalProps extends ConnectDappMessageData {
  dAppName?: string
}

const ConnectDappNewAddressModal = memo<ConnectDappNewAddressModalProps>(({ icon, dAppName, host, group }) => {
  const { t } = useTranslation()
  const { dismissModal, onUserDismiss } = useModalContext()

  const handleDeclinePress = () => {
    dismissModal()
    onUserDismiss?.()
  }

  return (
    <BottomModal2 title={t('New address')} contentVerticalGap>
      <ConnectDappModalHeader dAppName={dAppName} dAppUrl={host} dAppIcon={icon} />

      <ConnectDappNewAddressModalContent group={group} onDeclinePress={handleDeclinePress} />
    </BottomModal2>
  )
})

export default ConnectDappNewAddressModal
