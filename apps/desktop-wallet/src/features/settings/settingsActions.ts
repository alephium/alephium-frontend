import { createAction } from '@reduxjs/toolkit'

import { Language, Settings } from '@/features/settings/settingsTypes'
import { ThemeType } from '@/features/theme/themeTypes'

export const languageChangeStarted = createAction('settings/languageChangeStarted')

export const languageChangeFinished = createAction('settings/languageChangeFinished')

export const systemLanguageMatchSucceeded = createAction<Language>('settings/systemLanguageMatchSucceeded')

export const systemLanguageMatchFailed = createAction('settings/systemLanguageMatchFailed')

export const systemRegionMatchSucceeded = createAction<string>('settings/systemRegionMatchSucceeded')

export const systemRegionMatchFailed = createAction('settings/systemRegionMatchFailed')

export const themeSettingsChanged = createAction<Settings['general']['theme']>('settings/themeSettingsChanged')

export const themeToggled = createAction<ThemeType>('settings/themeToggled')

export const discreetModeToggled = createAction('settings/discreetModeToggled')

export const passwordRequirementToggled = createAction('settings/passwordRequirementToggled')

export const devToolsToggled = createAction('settings/devToolsToggled')

export const languageChanged = createAction<Settings['general']['language']>('settings/languageChanged')

export const numberFormatRegionChanged = createAction<Settings['general']['region']>(
  'settings/numberFormatRegionChanged'
)

export const walletLockTimeChanged = createAction<Settings['general']['walletLockTimeInMinutes']>(
  'settings/walletLockTimeChanged'
)

export const analyticsToggled = createAction<Settings['general']['analytics']>('settings/analyticsToggled')

export const localStorageGeneralSettingsMigrated = createAction<Settings['general']>(
  'settings/localStorageGeneralSettingsMigrated'
)
