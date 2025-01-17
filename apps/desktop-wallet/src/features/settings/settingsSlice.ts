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
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/th'

import { fiatCurrencyChanged } from '@alephium/shared'
import { createListenerMiddleware, createSlice, isAnyOf } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import posthog from 'posthog-js'

import i18next from '@/features/localization/i18n'
import {
  languageChanged,
  languageChangeFinished,
  languageChangeStarted,
  systemLanguageMatchFailed,
  systemLanguageMatchSucceeded
} from '@/features/localization/localizationActions'
import {
  analyticsToggled,
  devToolsToggled,
  discreetModeToggled,
  localStorageGeneralSettingsMigrated,
  numberFormatRegionChanged,
  passwordRequirementToggled,
  systemRegionMatchFailed,
  systemRegionMatchSucceeded,
  themeSettingsChanged,
  themeToggled,
  walletLockTimeChanged
} from '@/features/settings/settingsActions'
import SettingsStorage from '@/features/settings/settingsPersistentStorage'
import { GeneralSettings } from '@/features/settings/settingsTypes'
import { RootState } from '@/storage/store'

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
