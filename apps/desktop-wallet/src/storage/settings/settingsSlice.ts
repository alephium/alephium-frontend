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

import 'dayjs/locale/bg'
import 'dayjs/locale/de'
import 'dayjs/locale/es'
import 'dayjs/locale/fr'
import 'dayjs/locale/id'
import 'dayjs/locale/it'
import 'dayjs/locale/pt'
import 'dayjs/locale/ru'
import 'dayjs/locale/tr'
import 'dayjs/locale/vi'
import 'dayjs/locale/el'

import { fiatCurrencyChanged } from '@alephium/shared'
import { createListenerMiddleware, createSlice, isAnyOf } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import posthog from 'posthog-js'

import i18next from '@/i18n'
import {
  analyticsToggled,
  devToolsToggled,
  discreetModeToggled,
  languageChanged,
  languageChangeFinished,
  languageChangeStarted,
  localStorageGeneralSettingsMigrated,
  numberFormatRegionChanged,
  passwordRequirementToggled,
  systemLanguageMatchFailed,
  systemLanguageMatchSucceeded,
  systemRegionMatchFailed,
  systemRegionMatchSucceeded,
  themeSettingsChanged,
  themeToggled,
  walletLockTimeChanged
} from '@/storage/settings/settingsActions'
import SettingsStorage from '@/storage/settings/settingsPersistentStorage'
import { RootState } from '@/storage/store'
import { GeneralSettings } from '@/types/settings'

const initialState = SettingsStorage.load('general') as GeneralSettings

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(localStorageGeneralSettingsMigrated, (_, { payload: generalSettings }) => generalSettings)
      .addCase(systemLanguageMatchFailed, (state) => {
        state.language = 'en-US'
      })
      .addCase(systemRegionMatchFailed, (state) => {
        state.region = 'en-US'
      })
      .addCase(themeSettingsChanged, (state, action) => {
        state.theme = action.payload
      })
      .addCase(themeToggled, (state, action) => {
        state.theme = action.payload
      })
      .addCase(discreetModeToggled, (state) => {
        state.discreetMode = !state.discreetMode
      })
      .addCase(passwordRequirementToggled, (state) => {
        state.passwordRequirement = !state.passwordRequirement
      })
      .addCase(devToolsToggled, (state) => {
        state.devTools = !state.devTools
      })
      .addCase(walletLockTimeChanged, (state, action) => {
        state.walletLockTimeInMinutes = action.payload
      })
      .addCase(analyticsToggled, (state, action) => {
        state.analytics = action.payload
      })
      .addCase(fiatCurrencyChanged, (state, action) => {
        state.fiatCurrency = action.payload
      })

    builder
      .addMatcher(isAnyOf(numberFormatRegionChanged, systemRegionMatchSucceeded), (state, action) => {
        state.region = action.payload
      })
      .addMatcher(isAnyOf(languageChanged, systemLanguageMatchSucceeded), (state, action) => {
        state.language = action.payload
      })
  }
})

export const settingsListenerMiddleware = createListenerMiddleware()

// When the settings change, store them in persistent storage
settingsListenerMiddleware.startListening({
  matcher: isAnyOf(
    themeSettingsChanged,
    themeToggled,
    discreetModeToggled,
    passwordRequirementToggled,
    devToolsToggled,
    languageChanged,
    systemLanguageMatchSucceeded,
    systemLanguageMatchFailed,
    systemRegionMatchSucceeded,
    systemRegionMatchFailed,
    numberFormatRegionChanged,
    walletLockTimeChanged,
    analyticsToggled,
    fiatCurrencyChanged
  ),
  effect: (_, { getState }) => {
    const state = getState() as RootState

    SettingsStorage.store('general', state.settings)
  }
})

settingsListenerMiddleware.startListening({
  matcher: isAnyOf(
    localStorageGeneralSettingsMigrated,
    languageChanged,
    systemLanguageMatchSucceeded,
    systemLanguageMatchFailed
  ),
  effect: async (_, { getState, dispatch }) => {
    const state = getState() as RootState

    const settings = state.settings

    const handleLanguageChange = async () => {
      if (!settings.language) return

      dispatch(languageChangeStarted())

      try {
        dayjs.locale(settings.language.slice(0, 2))
        await i18next.changeLanguage(settings.language)
      } catch (e) {
        console.error(e)
        posthog.capture('Error', { message: 'Changing language' })
      } finally {
        dispatch(languageChangeFinished())
      }
    }

    if (settings.language && i18next.language !== settings.language) {
      handleLanguageChange()
    }
  }
})

export default settingsSlice
