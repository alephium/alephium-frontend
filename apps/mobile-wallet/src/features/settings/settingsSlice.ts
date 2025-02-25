import { appReset, fiatCurrencyChanged } from '@alephium/shared'
import { createListenerMiddleware, createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit'

import {
  languageChanged,
  systemLanguageMatchFailed,
  systemLanguageMatchSucceeded
} from '~/features/localization/localizationActions'
import {
  numberFormatRegionChanged,
  systemRegionMatchFailed,
  systemRegionMatchSucceeded
} from '~/features/settings/regionSettings/regionSettingsActions'
import { allBiometricsEnabled, analyticsIdGenerated } from '~/features/settings/settingsActions'
import { defaultGeneralSettings, persistSettings } from '~/features/settings/settingsPersistentStorage'
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
      .addCase(systemRegionMatchFailed, (state) => {
        state.region = 'en-US'
      })
      .addMatcher(isAnyOf(numberFormatRegionChanged, systemRegionMatchSucceeded), (state, action) => {
        state.region = action.payload
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
    numberFormatRegionChanged,
    systemRegionMatchSucceeded,
    systemRegionMatchFailed,
    appReset
  ),
  effect: async (_, { getState }) => {
    const state = (getState() as RootState)[sliceName]

    if (state.loadedFromStorage) await persistSettings('general', state)
  }
})

export default settingsSlice
