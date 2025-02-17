import { isNetworkValid, NetworkNames, networkPresetSwitched } from '@alephium/shared'
import { ChainInfo } from '@alephium/walletconnect-provider'

import { useCurrentlyOnlineNetworkId } from '@/network/useCurrentlyOnlineNetworkId'
import { useSharedDispatch } from '@/redux'

export const useWalletConnectNetwork = (networkId: ChainInfo['networkId'], onSuccess?: () => Promise<void>) => {
  const currentNetworkId = useCurrentlyOnlineNetworkId()
  const dispatch = useSharedDispatch()

  const handleSwitchNetworkPress = async () => {
    if (networkId === 'mainnet' || networkId === 'testnet' || networkId === 'devnet') {
      onSuccess && (await onSuccess())
      dispatch(networkPresetSwitched(NetworkNames[networkId]))
    }
  }

  const showNetworkWarning = networkId && currentNetworkId && !isNetworkValid(networkId, currentNetworkId)

  return {
    handleSwitchNetworkPress,
    showNetworkWarning
  }
}
