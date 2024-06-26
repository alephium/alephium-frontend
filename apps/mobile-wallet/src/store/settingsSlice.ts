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

import { appReset, fiatCurrencyChanged } from '@alephium/shared'
import { createListenerMiddleware, createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'

import {
  languageChanged,
  systemLanguageMatchFailed,
  systemLanguageMatchSucceeded
} from '~/features/localization/localizationActions'
import { defaultGeneralSettings, persistSettings } from '~/persistent-storage/settings'
import { allBiometricsEnabled, analyticsIdGenerated } from '~/store/settings/settingsActions'
import { RootState } from '~/store/store'
import { GeneralSettings } from '~/types/settings'

const sliceName = 'settings'

const initialState: GeneralSettings & {
  loadedFromStorage: boolean
} = {
  ...defaultGeneralSettings,
  loadedFromStorage: false
}

const settingsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    storedGeneralSettingsLoaded: (_, action: PayloadAction<GeneralSettings>) => ({
      ...action.payload,
      loadedFromStorage: true
    }),
    themeChanged: (state, action: PayloadAction<GeneralSettings['theme']>) => {
      state.theme = action.payload
    },
    discreetModeToggled: (state) => {
      state.discreetMode = !state.discreetMode
    },
    passwordRequirementToggled: (state) => {
      state.requireAuth = !state.requireAuth
    },
    analyticsToggled: (state) => {
      state.analytics = !state.analytics
    },
    walletConnectToggled: (state) => {
      state.walletConnect = !state.walletConnect
    },
    biometricsToggled: (state) => {
      state.usesBiometrics = !state.usesBiometrics
    },
    autoLockSecondsChanged: (state, { payload }: PayloadAction<GeneralSettings['autoLockSeconds']>) => {
      state.autoLockSeconds = payload
    }
  },
  extraReducers(builder) {
    builder
      .addCase(appReset, () => initialState)
      .addCase(fiatCurrencyChanged, (state, { payload: currency }) => {
        state.currency = currency
      })
      .addCase(analyticsIdGenerated, (state, { payload: analyticsId }) => {
        state.analyticsId = analyticsId
      })
      .addCase(allBiometricsEnabled, (state) => {
        state.requireAuth = true
        state.usesBiometrics = true
      })
      .addCase(systemLanguageMatchSucceeded, (state, { payload: language }) => {
        state.language = language
      })
      .addCase(systemLanguageMatchFailed, (state) => {
        state.language = 'en-US'
      })
      .addCase(languageChanged, (state, action) => {
        state.language = action.payload
      })
  }
})

export const {
  storedGeneralSettingsLoaded,
  themeChanged,
  discreetModeToggled,
  passwordRequirementToggled,
  analyticsToggled,
  walletConnectToggled,
  biometricsToggled,
  autoLockSecondsChanged
} = settingsSlice.actions

export const settingsListenerMiddleware = createListenerMiddleware()

// When the settings change, store them in persistent storage
settingsListenerMiddleware.startListening({
  matcher: isAnyOf(
    themeChanged,
    discreetModeToggled,
    passwordRequirementToggled,
    fiatCurrencyChanged,
    analyticsIdGenerated,
    analyticsToggled,
    walletConnectToggled,
    biometricsToggled,
    autoLockSecondsChanged,
    allBiometricsEnabled,
    languageChanged,
    appReset
  ),
  effect: async (_, { getState }) => {
    const state = (getState() as RootState)[sliceName]

    if (state.loadedFromStorage) await persistSettings('general', state)
  }
})

export default settingsSlice
