import { networkPresetSwitched } from '@alephium/shared/store'
import { NetworkNames } from '@alephium/shared/types'
import { isNetworkValid } from '@alephium/shared/utils'
import { ChainInfo } from '@alephium/walletconnect-provider'

import { useCurrentlyOnlineNetworkId } from '../network/networkHooks'
import { useSharedDispatch } from '../redux'

export const useWalletConnectNetwork = (networkId: ChainInfo['networkId'], onSuccess?: () => Promise<void>) => {
  const currentNetworkId = useCurrentlyOnlineNetworkId()
  const dispatch = useSharedDispatch()

  const handleSwitchNetworkPress = async () => {
    if (networkId === 'mainnet' || networkId === 'testnet' || networkId === 'devnet') {
      onSuccess && (await onSuccess())
      dispatch(networkPresetSwitched(NetworkNames[networkId]))
    }
  }

  const showNetworkWarning =
    !!networkId && currentNetworkId !== undefined && !isNetworkValid(networkId, currentNetworkId)

  return {
    handleSwitchNetworkPress,
    showNetworkWarning
  }
}
