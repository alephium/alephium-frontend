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

import { defaultGeneralSettings, storeSettings } from '../storage/settings'
import { GeneralSettings } from '../types/settings'
import { RootState } from './store'

const sliceName = 'settings'

const initialState: GeneralSettings = defaultGeneralSettings

const settingsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    generalSettingsChanged: (state, action: PayloadAction<GeneralSettings>) => {
      return { ...action.payload }
    },
    themeChanged: (state, action: PayloadAction<GeneralSettings['theme']>) => {
      state.theme = action.payload
    },
    walletLockTimeInMinutesChanged: (state, action: PayloadAction<GeneralSettings['walletLockTimeInMinutes']>) => {
      state.walletLockTimeInMinutes = action.payload
    },
    discreetModeChanged: (state, action: PayloadAction<GeneralSettings['discreetMode']>) => {
      state.discreetMode = action.payload
    },
    passwordRequirementChanged: (state, action: PayloadAction<GeneralSettings['passwordRequirement']>) => {
      state.passwordRequirement = action.payload
    }
  }
})

export const {
  generalSettingsChanged,
  themeChanged,
  walletLockTimeInMinutesChanged,
  discreetModeChanged,
  passwordRequirementChanged
} = settingsSlice.actions

export const settingsListenerMiddleware = createListenerMiddleware()

// When the settings change, store them in persistent storage
settingsListenerMiddleware.startListening({
  matcher: isAnyOf(
    generalSettingsChanged,
    themeChanged,
    walletLockTimeInMinutesChanged,
    discreetModeChanged,
    passwordRequirementChanged
  ),
  effect: async (action, { getState }) => {
    const state = getState() as RootState

    await storeSettings('general', state[sliceName])
  }
})

export default settingsSlice
