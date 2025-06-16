import { ConnectDappMessageData } from '@alephium/wallet-dapp-provider'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import ConnectDappModalHeader from '~/features/ecosystem/modals/ConnectDappModalHeader'
import NewAddressModalContent from '~/features/ecosystem/modals/NewAddressModalContent'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { ModalBaseProp } from '~/features/modals/modalTypes'

interface NewAddressModalProps extends ConnectDappMessageData, ModalBaseProp {
  dAppName?: string
}

const NewAddressModal = memo<NewAddressModalProps>(({ icon, dAppName, host, group, onUserDismiss }) => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()

  const handleDeclinePress = () => {
    dismissModal()
    onUserDismiss?.()
  }

  return (
    <BottomModal2 title={t('New address')} contentVerticalGap>
      <ConnectDappModalHeader dAppName={dAppName} dAppUrl={host} dAppIcon={icon} />

      <NewAddressModalContent group={group} onDeclinePress={handleDeclinePress} />
    </BottomModal2>
  )
})

export default NewAddressModal
