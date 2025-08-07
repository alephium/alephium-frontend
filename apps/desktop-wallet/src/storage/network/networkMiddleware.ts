import {
  customNetworkSettingsSaved,
  explorerApiClientInitSucceeded,
  networkPresetSwitched,
  nodeApiClientInitSucceeded
} from '@alephium/shared'
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'

import SettingsStorage from '@/features/settings/settingsPersistentStorage'
import { RootState } from '@/storage/store'

export const networkListenerMiddleware = createListenerMiddleware()

// When the network changes, store settings in persistent storage
networkListenerMiddleware.startListening({
  matcher: isAnyOf(
    networkPresetSwitched,
    customNetworkSettingsSaved,
    nodeApiClientInitSucceeded,
    explorerApiClientInitSucceeded
  ),
  effect: (_, { getState }) => {
    const state = getState() as RootState

    SettingsStorage.store('network', state.network.settings)
  }
})
