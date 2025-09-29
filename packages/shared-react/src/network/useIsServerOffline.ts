import { useSharedSelector } from '@/redux'

export const useIsExplorerOffline = () => useSharedSelector((s) => s.network.explorerStatus === 'offline')
export const useIsNodeOffline = () => useSharedSelector((s) => s.network.nodeStatus === 'offline')
