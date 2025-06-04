import {
  Address,
  getNetworkIdFromNetworkName,
  getNetworkNameFromNetworkId,
  NetworkName,
  NetworkPreset,
  networkSettingsPresets,
  selectAddressByHash,
  selectAddressesInGroup
} from '@alephium/shared'
import {
  useCurrentlyOnlineNetworkId,
  useFetchAddressesHashesSortedByLastUse,
  useWalletConnectNetwork
} from '@alephium/shared-react'
import { ConnectDappMessageData, WalletAccountWithNetwork } from '@alephium/wallet-dapp-provider'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { capitalize } from 'lodash'
import { memo, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import ConnectDappModalHeader from '~/features/ecosystem/modals/ConnectDappModalHeader'
import ConnectDappModalNewAddress from '~/features/ecosystem/modals/ConnectDappModalNewAddress'
import ConnectDappModalSwitchNetwork from '~/features/ecosystem/modals/ConnectDappModalSwitchNetwork'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import { persistSettings } from '~/features/settings/settingsPersistentStorage'
import { useAppSelector } from '~/hooks/redux'
import { getAddressAsymetricKey } from '~/persistent-storage/wallet'

interface ConnectDappModalProps extends ConnectDappMessageData, ModalBaseProp {
  dAppName?: string
  onReject: () => void
  onApprove: (data: WalletAccountWithNetwork) => void
}

const ConnectDappModal = memo<ConnectDappModalProps>(
  ({ id, icon, dAppName, keyType, group, host, networkId: networkName, onReject, onApprove }) => {
    // TODO: use keyType after integrating groupless addresses
    const { t } = useTranslation()

    const currentlyOnlineNetworkId = useCurrentlyOnlineNetworkId()
    const network = useAppSelector((s) => s.network)
    const requiresNetworkSwitch = currentlyOnlineNetworkId !== getNetworkIdFromNetworkName(networkName as NetworkName)

    const { data: allAddressesStr } = useFetchAddressesHashesSortedByLastUse()
    const addressesInGroup = useAppSelector((s) => selectAddressesInGroup(s, group))
    const allAddressesStrInGroup = useMemo(
      () => allAddressesStr.filter((addressStr) => addressesInGroup.includes(addressStr)),
      [addressesInGroup, allAddressesStr]
    )

    const { dismiss } = useBottomSheetModal()

    const handleDeclinePress = () => {
      dismiss(id)
      onReject()
    }

    const handleAddressSelect = async (address: Address) => {
      const publicKey = await getAddressAsymetricKey(allAddressesStrInGroup[0], 'public')

      onApprove({
        address: allAddressesStrInGroup[0],
        network: {
          id: network.name,
          name: capitalize(network.name),
          nodeUrl: network.settings.nodeHost,
          explorerApiUrl: network.settings.explorerApiHost,
          explorerUrl: network.settings.explorerUrl
        },
        type: 'alephium',
        signer: {
          type: 'local_secret',
          keyType: keyType ?? 'default', // TODO: replace with address.keyType after groupless addresses integration
          publicKey,
          derivationIndex: address.index,
          group: address.group
        }
      })
      dismiss(id)
    }

    return (
      <BottomModal2
        modalId={id}
        title={t('Connect to dApp')}
        contentVerticalGap={allAddressesStrInGroup.length > 1}
        flashListProps={
          allAddressesStrInGroup.length > 1
            ? {
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
              }
            : undefined
        }
      >
        <ConnectDappModalHeader dAppName={dAppName} dAppUrl={host} dAppIcon={icon} />

        {requiresNetworkSwitch ? (
          <ConnectDappModalNetworkSection networkId={networkName} onDeclinePress={handleDeclinePress} />
        ) : allAddressesStrInGroup.length === 0 ? (
          <ConnectDappModalNewAddress group={group} onDeclinePress={handleDeclinePress} />
        ) : allAddressesStrInGroup.length === 1 ? (
          <AutoSelectAddress addressStr={allAddressesStrInGroup[0]} onSelect={handleAddressSelect} />
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

interface AutoSelectAddressProps {
  addressStr: string
  onSelect: (address: Address) => void
}

const AutoSelectAddress = ({ addressStr, onSelect }: AutoSelectAddressProps) => {
  const address = useAppSelector((s) => selectAddressByHash(s, addressStr))

  useEffect(() => {
    if (address) onSelect(address)
  }, [address, onSelect])

  return null
}
