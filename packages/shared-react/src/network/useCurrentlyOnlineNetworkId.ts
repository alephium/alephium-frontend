import { selectCurrentlyOnlineNetworkId } from '@/network/networkSelectors'
import { useSharedSelector } from '@/redux'

export const useCurrentlyOnlineNetworkId = () => useSharedSelector(selectCurrentlyOnlineNetworkId)
