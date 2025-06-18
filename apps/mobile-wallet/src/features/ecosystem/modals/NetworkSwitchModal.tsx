import { getNetworkNameFromNetworkId, NetworkPreset, networkSettingsPresets } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId, useWalletConnectNetwork } from '@alephium/shared-react'
import { ConnectDappMessageData } from '@alephium/wallet-dapp-provider'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import ConnectDappModalHeader from '~/features/ecosystem/modals/ConnectDappModalHeader'
import NetworkSwitchModalContent from '~/features/ecosystem/modals/NetworkSwitchModalContent'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { persistSettings } from '~/features/settings/settingsPersistentStorage'
import { useAppDispatch } from '~/hooks/redux'

interface NetworkSwitchModalProps extends ConnectDappMessageData {
  dAppName?: string
}

const NetworkSwitchModal = memo<NetworkSwitchModalProps>(({ icon, dAppName, host, networkId: networkName }) => {
  const { t } = useTranslation()
  const { dismissModal, onUserDismiss } = useModalContext()
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
    dispatch(activateAppLoading({ text: t('Switching networks'), bg: 'full', blur: false, minDurationMs: 3000 }))
    await handleSwitchNetworkPress()
    dismissModal()
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
})

export default NetworkSwitchModal
