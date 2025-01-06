import { createSelector } from '@reduxjs/toolkit'

import { RootState } from '@/storage/store'

export const selectCurrentlyOnlineNetworkId = createSelector(
  (state: RootState) => state.network,
  (network) => (network.status === 'online' ? network.settings.networkId : undefined)
)
