import { networkSettingsPresets } from '@alephium/shared'
import { NetworkNames } from '@alephium/shared/types'
import { useCurrentlyOnlineNetworkId } from '@alephium/shared-react'

const useIsPowfiEnabled = () => useCurrentlyOnlineNetworkId() === networkSettingsPresets[NetworkNames.mainnet].networkId

export default useIsPowfiEnabled
