import { networkSettingsPresets } from '@alephium/shared'
import { NetworkNames } from '@alephium/shared/types'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'

const useIsStakingEnabled = () =>
  useCurrentlyOnlineNetworkId() === networkSettingsPresets[NetworkNames.testnet].networkId

export default useIsStakingEnabled
