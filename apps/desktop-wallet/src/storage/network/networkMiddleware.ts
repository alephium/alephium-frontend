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

import { apiClientInitSucceeded, customNetworkSettingsSaved, networkPresetSwitched } from '@alephium/shared'
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'

import SettingsStorage from '@/features/settings/settingsPersistentStorage'
import { RootState } from '@/storage/store'

export const networkListenerMiddleware = createListenerMiddleware()

// When the network changes, store settings in persistent storage
networkListenerMiddleware.startListening({
  matcher: isAnyOf(networkPresetSwitched, customNetworkSettingsSaved, apiClientInitSucceeded),
  effect: (_, { getState }) => {
    const state = getState() as RootState

    SettingsStorage.store('network', state.network.settings)
  }
})
