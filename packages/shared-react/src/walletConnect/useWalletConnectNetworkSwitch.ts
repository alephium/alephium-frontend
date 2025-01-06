import { isNetworkValid, NetworkNames, networkPresetSwitched } from '@alephium/shared'
import { ChainInfo } from '@alephium/walletconnect-provider'

import { useSharedDispatch, useSharedSelector } from '@/redux'

export const useWalletConnectNetwork = (networkId: ChainInfo['networkId'], onSuccess?: () => Promise<void>) => {
  const currentNetworkId = useSharedSelector((s) => s.network.settings.networkId)
  const dispatch = useSharedDispatch()

  const handleSwitchNetworkPress = async () => {
    if (networkId === 'mainnet' || networkId === 'testnet' || networkId === 'devnet') {
      onSuccess && (await onSuccess())
      dispatch(networkPresetSwitched(NetworkNames[networkId]))
    }
  }

  const showNetworkWarning = networkId && !isNetworkValid(networkId, currentNetworkId)

  return {
    handleSwitchNetworkPress,
    showNetworkWarning
  }
}
