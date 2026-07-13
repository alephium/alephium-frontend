import { selectDappConnectEligibleAddresses } from '@alephium/shared/store'
import { Address } from '@alephium/shared/types'
import { useFetchAddressesHashesSortedByLastUse } from '@alephium/shared-react'
import { ConnectDappMessageData } from '@alephium/wallet-dapp-provider'
import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import AddressBox from '~/components/AddressBox'
import { ConnectedAddressPayload } from '~/features/ecosystem/dAppMessaging/dAppMessagingTypes'
import { getConnectedAddressPayload, useNetwork } from '~/features/ecosystem/dAppMessaging/dAppMessagingUtils'
import ConnectDappModalHeader from '~/features/ecosystem/modals/ConnectDappModalHeader'
import BottomModal, { DEFAULT_SNAP_POINTS } from '~/features/modals/BottomModal'
import { useModalContext } from '~/features/modals/ModalContext'
import { useAppSelector } from '~/hooks/redux'

interface ConnectDappModalProps extends ConnectDappMessageData {
  dAppName?: string
  onApprove: (data: ConnectedAddressPayload) => void
}

const ConnectDappModal = memo<ConnectDappModalProps>(({ icon, dAppName, keyType, group, host, onApprove }) => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()
  const network = useNetwork()

  const { data: allAddressesStr } = useFetchAddressesHashesSortedByLastUse()
  const eligibleAddresses = useAppSelector((s) => selectDappConnectEligibleAddresses(s, group, keyType))
  const allAddressesStrInGroup = useMemo(
    () => allAddressesStr.filter((addressStr) => eligibleAddresses.includes(addressStr)),
    [eligibleAddresses, allAddressesStr]
  )

  const handleAddressSelect = useCallback(
    async (address: Address) => {
      const connectedAddressPayload = await getConnectedAddressPayload(network, address, host, icon)
      onApprove(connectedAddressPayload)
      dismissModal()
    },
    [dismissModal, host, icon, network, onApprove]
  )

  return (
    <BottomModal
      title={t('Connect to {{ dAppUrl }}', { dAppUrl: host })}
      contentVerticalGap={allAddressesStrInGroup.length > 1}
      bottomSheetModalProps={{ enableDynamicSizing: false, snapPoints: DEFAULT_SNAP_POINTS }}
      flashListProps={{
        data: allAddressesStrInGroup,
        renderItem: ({ item: addressHash, index }) => (
          <AddressBox
            key={addressHash}
            addressHash={addressHash}
            onPress={(address) => handleAddressSelect(address)}
            isLast={index === allAddressesStrInGroup.length - 1}
            origin="connect_dapp_modal"
            showGroup
          />
        )
      }}
    >
      <ConnectDappModalHeader dAppName={dAppName} dAppUrl={host} dAppIcon={icon} />
    </BottomModal>
  )
})

export default ConnectDappModal
