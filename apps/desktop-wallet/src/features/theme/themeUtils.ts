import { themeSettingsChanged, themeToggled } from '@/features/settings/settingsActions'
import SettingsStorage from '@/features/settings/settingsPersistentStorage'
import { GeneralSettings } from '@/features/settings/settingsTypes'
import { ThemeSettings, ThemeType } from '@/features/theme/themeTypes'
import { store } from '@/storage/store'

export const switchTheme = (theme: ThemeSettings) => {
  window.electron?.theme.setNativeTheme(theme)
  store.dispatch(themeSettingsChanged(theme))
}

export const toggleTheme = (theme: ThemeType) => {
  window.electron?.theme.setNativeTheme(theme)
  store.dispatch(themeToggled(theme))
}

export const getThemeType = () => {
  const storedSettings = SettingsStorage.load('general') as GeneralSettings

  return storedSettings.theme === 'system' ? 'dark' : storedSettings.theme
}
