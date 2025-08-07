import { SharedRootState } from '@alephium/shared'
import { createSelector } from '@reduxjs/toolkit'

export const selectCurrentlyOnlineNetworkId = createSelector(
  (state: SharedRootState) => state.network,
  (network) => (network.nodeStatus === 'online' ? network.settings.networkId : undefined)
)
