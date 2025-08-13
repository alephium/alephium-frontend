import { createSlice } from '@reduxjs/toolkit'

import { defaultNetworkSettings, getNetworkName, networkSettingsPresets } from '@/network'
import { appReset } from '@/store/global/globalActions'
import {
  customNetworkSettingsSaved,
  explorerApiClientInitFailed,
  explorerApiClientInitSucceeded,
  localStorageNetworkSettingsLoaded,
  localStorageNetworkSettingsMigrated,
  networkPresetSwitched,
  nodeApiClientInitFailed,
  nodeApiClientInitSucceeded
} from '@/store/network/networkActions'
import { NetworkNames, NetworkSettings, NetworkState, NetworkStatus } from '@/types/network'

const initialState: NetworkState = {
  name: NetworkNames.mainnet,
  settings: defaultNetworkSettings,
  nodeStatus: 'uninitialized',
  explorerStatus: 'uninitialized'
}

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(localStorageNetworkSettingsMigrated, (_, action) => parseSettingsUpdate(action.payload))
      .addCase(localStorageNetworkSettingsLoaded, (_, action) => parseSettingsUpdate(action.payload))
      .addCase(customNetworkSettingsSaved, (_, action) => parseSettingsUpdate(action.payload))
      .addCase(networkPresetSwitched, (_, action) => {
        const networkName = action.payload

        return {
          name: networkName,
          settings: networkSettingsPresets[networkName],
          nodeStatus: 'connecting',
          explorerStatus: 'connecting'
        }
      })
      .addCase(nodeApiClientInitSucceeded, (state, action) => {
        state.settings.networkId = action.payload.networkId
        state.nodeStatus = 'online'
      })
      .addCase(nodeApiClientInitFailed, (state) => {
        state.nodeStatus = 'offline'
      })
      .addCase(explorerApiClientInitSucceeded, (state) => {
        state.explorerStatus = 'online'
      })
      .addCase(explorerApiClientInitFailed, (state) => {
        state.explorerStatus = 'offline'
      })
      .addCase(appReset, () => initialState)
  }
})

export default networkSlice

// Reducers helper function

const parseSettingsUpdate = (settings: NetworkSettings) => ({
  name: getNetworkName(settings),
  settings,
  nodeStatus: !settings.nodeHost ? ('offline' as NetworkStatus) : ('connecting' as NetworkStatus),
  explorerStatus: !settings.explorerApiHost ? ('offline' as NetworkStatus) : ('connecting' as NetworkStatus)
})
