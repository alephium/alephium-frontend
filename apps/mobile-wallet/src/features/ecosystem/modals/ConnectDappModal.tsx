import {
  getNetworkIdFromNetworkName,
  getNetworkNameFromNetworkId,
  NetworkName,
  NetworkPreset,
  networkSettingsPresets,
  selectAddressesInGroup
} from '@alephium/shared'
import {
  useCurrentlyOnlineNetworkId,
  useFetchAddressesHashesSortedByLastUse,
  useWalletConnectNetwork
} from '@alephium/shared-react'
import { ConnectDappMessageData } from '@alephium/wallet-dapp-provider'
import { BottomSheetFlashListProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/BottomSheetFlashList'
import { memo, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import { ConnectedAddressPayload } from '~/features/ecosystem/dAppMessaging/dAppMessagingTypes'
import useGetConnectedAddressPayload from '~/features/ecosystem/dAppMessaging/useGetAddressNonSensitiveInfo'
import ConnectDappModalHeader from '~/features/ecosystem/modals/ConnectDappModalHeader'
import ConnectDappModalNewAddress from '~/features/ecosystem/modals/ConnectDappModalNewAddress'
import ConnectDappModalSwitchNetwork from '~/features/ecosystem/modals/ConnectDappModalSwitchNetwork'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import useModalDismiss from '~/features/modals/useModalDismiss'
import { persistSettings } from '~/features/settings/settingsPersistentStorage'
import { useAppSelector } from '~/hooks/redux'

interface ConnectDappModalProps extends ConnectDappMessageData, ModalBaseProp {
  dAppName?: string
  onReject: () => void
  onApprove: (data: ConnectedAddressPayload) => void
}

const ConnectDappModal = memo<ConnectDappModalProps>(
  ({ id, icon, dAppName, keyType, group, host, networkId: networkName, onReject, onApprove }) => {
    // TODO: use keyType after integrating groupless addresses
    const { t } = useTranslation()
    const { dismissModal, onDismiss } = useModalDismiss({ id, onUserDismiss: onReject })
    const { getConnectedAddressPayload } = useGetConnectedAddressPayload()

    const currentlyOnlineNetworkId = useCurrentlyOnlineNetworkId()
    const requiresNetworkSwitch = currentlyOnlineNetworkId !== getNetworkIdFromNetworkName(networkName as NetworkName)

    const { data: allAddressesStr } = useFetchAddressesHashesSortedByLastUse()
    const addressesInGroup = useAppSelector((s) => selectAddressesInGroup(s, group))
    const allAddressesStrInGroup = useMemo(
      () => allAddressesStr.filter((addressStr) => addressesInGroup.includes(addressStr)),
      [addressesInGroup, allAddressesStr]
    )

    const handleAddressSelect = useCallback(
      async (addressStr: string) => {
        const connectedAddressPayload = await getConnectedAddressPayload({ addressStr, host, keyType })

        if (!connectedAddressPayload) return

        onApprove(connectedAddressPayload)
        dismissModal()
      },
      [dismissModal, getConnectedAddressPayload, host, keyType, onApprove]
    )

    // If there is only one address in the group, select it automatically
    useEffect(() => {
      if (allAddressesStrInGroup.length === 1) handleAddressSelect(allAddressesStrInGroup[0])
    }, [allAddressesStrInGroup, dismissModal, handleAddressSelect])

    const handleDeclinePress = () => {
      dismissModal()
      onReject()
    }

    const additionalProps =
      !requiresNetworkSwitch && allAddressesStrInGroup.length > 1
        ? {
            flashListProps: {
              data: allAddressesStrInGroup,
              estimatedItemSize: 70,
              renderItem: ({ item: addressHash, index }) => (
                <AddressBox
                  key={addressHash}
                  addressHash={addressHash}
                  onPress={() => handleAddressSelect(addressHash)}
                  isLast={index === allAddressesStrInGroup.length - 1}
                  origin="connectDappModal"
                  showGroup
                />
              )
            } as BottomSheetFlashListProps<string>
          }
        : {}

    return (
      <BottomModal2
        onDismiss={onDismiss}
        modalId={id}
        title={t('Connect to dApp')}
        contentVerticalGap={allAddressesStrInGroup.length > 1}
        {...additionalProps}
      >
        <ConnectDappModalHeader dAppName={dAppName} dAppUrl={host} dAppIcon={icon} />

        {requiresNetworkSwitch ? (
          <ConnectDappModalNetworkSection networkId={networkName} onDeclinePress={handleDeclinePress} />
        ) : allAddressesStrInGroup.length === 0 ? (
          <ConnectDappModalNewAddress group={group} onDeclinePress={handleDeclinePress} />
        ) : null}
      </BottomModal2>
    )
  }
)

export default ConnectDappModal

interface ConnectDappModalNetworkSectionProps extends Pick<ConnectDappMessageData, 'networkId'> {
  onDeclinePress: () => void
}

const ConnectDappModalNetworkSection = ({ networkId, onDeclinePress }: ConnectDappModalNetworkSectionProps) => {
  const { t } = useTranslation()
  const currentlyOnlineNetworkId = useCurrentlyOnlineNetworkId()
  const networkStatus = useAppSelector((s) => s.network.status)
  const currentNetworkName = getNetworkNameFromNetworkId(currentlyOnlineNetworkId)
  const requiredNetworkName = networkId as NetworkPreset
  const { handleSwitchNetworkPress, showNetworkWarning } = useWalletConnectNetwork(requiredNetworkName, () =>
    persistSettings('network', networkSettingsPresets[requiredNetworkName])
  )

  if (networkStatus === 'connecting') return <AppText>{t('Reconnecting')}</AppText>

  if (networkStatus === 'offline')
    return <AppText>{t('The app is offline and trying to reconnect. Please, check your network settings.')}</AppText>

  if (networkStatus === 'online' && showNetworkWarning && currentNetworkName)
    return (
      <ConnectDappModalSwitchNetwork
        currentNetworkName={currentNetworkName}
        requiredNetworkName={requiredNetworkName}
        onSwitchNetworkPress={handleSwitchNetworkPress}
        onDeclinePress={onDeclinePress}
      />
    )
}
