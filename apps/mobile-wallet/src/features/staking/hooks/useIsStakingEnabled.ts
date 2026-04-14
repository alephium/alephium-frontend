import { NetworkNames, networkSettingsPresets } from '@alephium/shared'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'

const useIsStakingEnabled = () =>
  useCurrentlyOnlineNetworkId() === networkSettingsPresets[NetworkNames.testnet].networkId

export default useIsStakingEnabled
