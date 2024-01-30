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

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { defaultNetwork, defaultNetworkSettings, networkPresetSettings } from '~/persistent-storage/settings'
import { appReset } from '~/store/appSlice'
import { NetworkName, NetworkPreset, NetworkStatus } from '~/types/network'
import { NetworkSettings } from '~/types/settings'
import { getNetworkName } from '~/utils/settings'

const sliceName = 'network'

interface NetworkState {
  name: NetworkName
  settings: NetworkSettings
  status: NetworkStatus
}

const initialState: NetworkState = {
  name: defaultNetwork,
  settings: defaultNetworkSettings,
  status: 'uninitialized'
}

const parseSettingsUpdate = (settings: NetworkSettings) => {
  const missingNetworkSettings = !settings.nodeHost || !settings.explorerApiHost

  return {
    name: getNetworkName(settings),
    settings,
    status: missingNetworkSettings ? ('offline' as NetworkStatus) : ('connecting' as NetworkStatus)
  }
}

const networkSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    networkPresetSwitched: (_, action: PayloadAction<NetworkPreset>) => {
      const networkName = action.payload

      return {
        name: networkName,
        settings: networkPresetSettings[networkName],
        status: 'connecting'
      }
    },
    storedNetworkSettingsLoaded: (_, action: PayloadAction<NetworkSettings>) => parseSettingsUpdate(action.payload),
    customNetworkSettingsSaved: (_, action: PayloadAction<NetworkSettings>) => parseSettingsUpdate(action.payload),
    apiClientInitSucceeded: (
      state,
      action: PayloadAction<{ networkId: NetworkSettings['networkId']; networkName: NetworkName }>
    ) => {
      state.settings.networkId = action.payload.networkId
      state.status = 'online'
    },
    apiClientInitFailed: (state) => {
      state.status = 'offline'
    }
  },
  extraReducers(builder) {
    builder.addCase(appReset, () => initialState)
  }
})

export const {
  networkPresetSwitched,
  storedNetworkSettingsLoaded,
  customNetworkSettingsSaved,
  apiClientInitSucceeded,
  apiClientInitFailed
} = networkSlice.actions

export default networkSlice
