import { networkSettingsPresets } from '@alephium/shared'
import { NetworkPreset } from '@alephium/shared/types'
import { getNetworkNameFromNetworkId } from '@alephium/shared/utils'
import { useCurrentlyOnlineNetworkId, useWalletConnectNetwork } from '@alephium/shared-react'
import { ConnectDappMessageData } from '@alephium/wallet-dapp-provider'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import ConnectDappModalHeader from '~/features/ecosystem/modals/ConnectDappModalHeader'
import NetworkSwitchModalContent from '~/features/ecosystem/modals/NetworkSwitchModalContent'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import BottomModal from '~/features/modals/BottomModal'
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
  const currentNetworkName =
    currentlyOnlineNetworkId !== undefined ? getNetworkNameFromNetworkId(currentlyOnlineNetworkId) : undefined
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
    <BottomModal title={t('Switch network')} contentVerticalGap notScrollable>
      <ConnectDappModalHeader dAppName={dAppName} dAppUrl={host} dAppIcon={icon} />

      <NetworkSwitchModalContent
        currentNetworkName={currentNetworkName}
        requiredNetworkName={requiredNetworkName}
        onSwitchNetworkPress={handleSwitchToRequiredNetwork}
        onDeclinePress={handleDeclinePress}
      />
    </BottomModal>
  )
})

export default NetworkSwitchModal
