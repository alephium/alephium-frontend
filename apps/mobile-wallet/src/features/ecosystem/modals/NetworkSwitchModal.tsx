import { getNetworkNameFromNetworkId, NetworkPreset, networkSettingsPresets } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId, useWalletConnectNetwork } from '@alephium/shared-react'
import { ConnectDappMessageData } from '@alephium/wallet-dapp-provider'
import { sleep } from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import ConnectDappModalHeader from '~/features/ecosystem/modals/ConnectDappModalHeader'
import NetworkSwitchModalContent from '~/features/ecosystem/modals/NetworkSwitchModalContent'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import { persistSettings } from '~/features/settings/settingsPersistentStorage'
import { useAppDispatch } from '~/hooks/redux'

interface NetworkSwitchModalProps extends ConnectDappMessageData, ModalBaseProp {
  dAppName?: string
}

const NetworkSwitchModal = memo<NetworkSwitchModalProps>(
  ({ icon, dAppName, host, networkId: networkName, onUserDismiss }) => {
    const { t } = useTranslation()
    const { dismissModal } = useModalContext()
    const currentlyOnlineNetworkId = useCurrentlyOnlineNetworkId()
    const currentNetworkName = getNetworkNameFromNetworkId(currentlyOnlineNetworkId)
    const requiredNetworkName = networkName as NetworkPreset
    const { handleSwitchNetworkPress } = useWalletConnectNetwork(requiredNetworkName, () =>
      persistSettings('network', networkSettingsPresets[requiredNetworkName])
    )
    const dispatch = useAppDispatch()

    if (currentNetworkName === undefined) return null

    const handleDeclinePress = () => {
      dismissModal()
      onUserDismiss?.()
    }

    const handleSwitchToRequiredNetwork = async () => {
      dispatch(activateAppLoading(t('Welcome to {{ networkName }}!', { networkName: requiredNetworkName })))
      await handleSwitchNetworkPress()
      dismissModal()
      await sleep(2000) // Give some time for the UI to update
      dispatch(deactivateAppLoading())
    }

    return (
      <BottomModal2 title={t('Switch network')} contentVerticalGap>
        <ConnectDappModalHeader dAppName={dAppName} dAppUrl={host} dAppIcon={icon} />

        <NetworkSwitchModalContent
          currentNetworkName={currentNetworkName}
          requiredNetworkName={requiredNetworkName}
          onSwitchNetworkPress={handleSwitchToRequiredNetwork}
          onDeclinePress={handleDeclinePress}
        />
      </BottomModal2>
    )
  }
)

export default NetworkSwitchModal
