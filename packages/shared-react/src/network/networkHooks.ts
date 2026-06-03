import { useSharedSelector } from '../redux'
import { selectCurrentlyOnlineNetworkId } from './networkSelectors'

export const useCurrentlyOnlineNetworkId = () => useSharedSelector(selectCurrentlyOnlineNetworkId)
export const useNetworkId = () => useSharedSelector((s) => s.network.settings.networkId)
export const useIsExplorerOffline = () => useSharedSelector((s) => s.network.explorerStatus === 'offline')
export const useIsExplorerOnline = () => useSharedSelector((s) => s.network.explorerStatus === 'online')
export const useIsNodeOffline = () => useSharedSelector((s) => s.network.nodeStatus === 'offline')
export const useIsNodeOnline = () => useSharedSelector((s) => s.network.nodeStatus === 'online')
