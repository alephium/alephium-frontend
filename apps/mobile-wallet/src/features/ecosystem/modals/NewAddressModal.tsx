import { ConnectDappMessageData } from '@alephium/wallet-dapp-provider'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import ConnectDappModalHeader from '~/features/ecosystem/modals/ConnectDappModalHeader'
import NewAddressModalContent from '~/features/ecosystem/modals/NewAddressModalContent'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import useModalDismiss from '~/features/modals/useModalDismiss'

interface NewAddressModalProps extends ConnectDappMessageData, ModalBaseProp {
  onReject: () => void
  dAppName?: string
}

const NewAddressModal = memo<NewAddressModalProps>(({ id, icon, dAppName, host, group, onReject }) => {
  const { t } = useTranslation()
  const { dismissModal, onDismiss } = useModalDismiss({ id, onUserDismiss: onReject })

  const handleDeclinePress = () => {
    dismissModal()
    onReject()
  }

  return (
    <BottomModal2 onDismiss={onDismiss} modalId={id} title={t('New address')} contentVerticalGap>
      <ConnectDappModalHeader dAppName={dAppName} dAppUrl={host} dAppIcon={icon} />

      <NewAddressModalContent group={group} onDeclinePress={handleDeclinePress} />
    </BottomModal2>
  )
})

export default NewAddressModal
