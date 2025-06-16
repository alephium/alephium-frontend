import { Address, selectAddressesInGroup } from '@alephium/shared'
import { useFetchAddressesHashesSortedByLastUse } from '@alephium/shared-react'
import { ConnectDappMessageData } from '@alephium/wallet-dapp-provider'
import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import AddressBox from '~/components/AddressBox'
import { ConnectedAddressPayload } from '~/features/ecosystem/dAppMessaging/dAppMessagingTypes'
import { getConnectedAddressPayload, useNetwork } from '~/features/ecosystem/dAppMessaging/dAppMessagingUtils'
import ConnectDappModalHeader from '~/features/ecosystem/modals/ConnectDappModalHeader'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import useModalDismiss from '~/features/modals/useModalDismiss'
import { useAppSelector } from '~/hooks/redux'

interface ConnectDappModalProps extends ConnectDappMessageData, ModalBaseProp {
  dAppName?: string
  onReject: () => void
  onApprove: (data: ConnectedAddressPayload) => void
}

const ConnectDappModal = memo<ConnectDappModalProps>(
  ({ id, icon, dAppName, keyType, group, host, onReject, onApprove }) => {
    // TODO: use keyType after integrating groupless addresses
    const { t } = useTranslation()
    const { dismissModal, onDismiss } = useModalDismiss({ id, onUserDismiss: onReject })
    const network = useNetwork()

    const { data: allAddressesStr } = useFetchAddressesHashesSortedByLastUse()
    const addressesInGroup = useAppSelector((s) => selectAddressesInGroup(s, group))
    const allAddressesStrInGroup = useMemo(
      () => allAddressesStr.filter((addressStr) => addressesInGroup.includes(addressStr)),
      [addressesInGroup, allAddressesStr]
    )

    const handleAddressSelect = useCallback(
      async (address: Address) => {
        const connectedAddressPayload = await getConnectedAddressPayload(network, address, host)
        onApprove(connectedAddressPayload)
        dismissModal()
      },
      [dismissModal, host, network, onApprove]
    )

    return (
      <BottomModal2
        onDismiss={onDismiss}
        modalId={id}
        title={t('Connect to dApp')}
        contentVerticalGap={allAddressesStrInGroup.length > 1}
        flashListProps={{
          data: allAddressesStrInGroup,
          estimatedItemSize: 70,
          renderItem: ({ item: addressHash, index }) => (
            <AddressBox
              key={addressHash}
              addressHash={addressHash}
              onPress={(address) => handleAddressSelect(address)}
              isLast={index === allAddressesStrInGroup.length - 1}
              origin="connectDappModal"
              showGroup
            />
          )
        }}
      >
        <ConnectDappModalHeader dAppName={dAppName} dAppUrl={host} dAppIcon={icon} />
      </BottomModal2>
    )
  }
)

export default ConnectDappModal
