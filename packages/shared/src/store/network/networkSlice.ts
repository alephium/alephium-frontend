/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { createSlice } from '@reduxjs/toolkit'

import { defaultNetworkSettings, getNetworkName, networkSettingsPresets } from '@/network'
import { appReset } from '@/store/global/globalActions'
import {
  apiClientInitFailed,
  apiClientInitSucceeded,
  customNetworkSettingsSaved,
  localStorageNetworkSettingsLoaded,
  localStorageNetworkSettingsMigrated,
  networkPresetSwitched
} from '@/store/network/networkActions'
import { NetworkNames, NetworkSettings, NetworkState, NetworkStatus } from '@/types/network'

const initialState: NetworkState = {
  name: NetworkNames.mainnet,
  settings: defaultNetworkSettings,
  status: 'uninitialized'
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
          status: 'connecting'
        }
      })
      .addCase(apiClientInitSucceeded, (state, action) => {
        state.settings.networkId = action.payload.networkId
        state.status = 'online'
      })
      .addCase(apiClientInitFailed, (state) => {
        state.status = 'offline'
      })
      .addCase(appReset, () => initialState)
  }
})

export default networkSlice

// Reducers helper function

const parseSettingsUpdate = (settings: NetworkSettings) => {
  const missingNetworkSettings = !settings.nodeHost || !settings.explorerApiHost

  return {
    name: getNetworkName(settings),
    settings,
    status: missingNetworkSettings ? ('offline' as NetworkStatus) : ('connecting' as NetworkStatus)
  }
}
