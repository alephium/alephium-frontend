/*
Copyright 2018 - 2022 The Alephium Authors
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

import { createListenerMiddleware, createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'

import { defaultNetwork, defaultNetworkSettings, networkPresetSettings, storeSettings } from '../storage/settings'
import { NetworkPreset, NetworkStatus, NetworkType } from '../types/network'
import { NetworkSettings } from '../types/settings'
import { getNetworkName } from '../utils/settings'
import { RootState } from './store'

const name = 'network'

interface NetworkState {
  network: NetworkType
  networkSettings: NetworkSettings
  networkStatus: NetworkStatus
}

const initialState: NetworkState = {
  network: defaultNetwork,
  networkSettings: defaultNetworkSettings,
  networkStatus: 'uninitialized'
}

const networkSlice = createSlice({
  name,
  initialState,
  reducers: {
    networkChanged: (state, action: PayloadAction<NetworkPreset>) => {
      state.network = action.payload
      state.networkSettings = networkPresetSettings[action.payload]
      state.networkStatus = 'connecting'
    },
    networkSettingsChanged: (state, action: PayloadAction<NetworkSettings>) => {
      state.network = getNetworkName(action.payload)
      state.networkSettings = action.payload

      const missingNetworkSettings = !action.payload.nodeHost || !action.payload.explorerApiHost
      state.networkStatus = missingNetworkSettings ? 'offline' : 'connecting'
    },
    networkStatusChanged: (state, action: PayloadAction<NetworkStatus>) => {
      state.networkStatus = action.payload
    }
  }
})

export const { networkChanged, networkSettingsChanged, networkStatusChanged } = networkSlice.actions

export const networkListenerMiddleware = createListenerMiddleware()

// When the network settings change, store them in persistent storage
networkListenerMiddleware.startListening({
  matcher: isAnyOf(networkChanged, networkSettingsChanged),
  effect: async (action, { getState }) => {
    const state = getState() as RootState

    await storeSettings('network', state[name].networkSettings)
  }
})

export default networkSlice.reducer
