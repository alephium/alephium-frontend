import { defaultNetworkSettings, NetworkNames } from '@alephium/shared'
import { Appearance } from 'react-native'

import { getSecurelyWithReportableError, storeSecurelyWithReportableError } from '~/persistent-storage/utils'
import { GeneralSettings, SettingsKey, SettingsPartial } from '~/types/settings'

const STORAGE_KEY = 'wallet-settings'

export const defaultNetwork = NetworkNames.mainnet

export const defaultGeneralSettings: GeneralSettings = {
  theme: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
  discreetMode: false,
  requireAuth: false,
  currency: 'USD',
  analytics: true,
  analyticsId: undefined,
  walletConnect: false,
  usesBiometrics: false,
  language: undefined,
  autoLockSeconds: 0
}

const defaultSettings = {
  general: defaultGeneralSettings,
  network: defaultNetworkSettings
}

const constructSettingsStorageKey = (key: SettingsKey) => `${STORAGE_KEY}-${key}`

export const loadSettings = async (key: SettingsKey): Promise<SettingsPartial> => {
  try {
    const settingsKey = constructSettingsStorageKey(key)
    const rawSettings = await getSecurelyWithReportableError(settingsKey, true, '')
    if (!rawSettings) return defaultSettings[key]

    const loadedSettings = JSON.parse(rawSettings) as SettingsPartial

    return {
      ...defaultSettings[key],
      ...loadedSettings
    }
  } catch (e) {
    console.error(e)
    return defaultSettings[key] // Fallback to default settings if something went wrong
  }
}

export const persistSettings = async (key: SettingsKey, settings: SettingsPartial) => {
  try {
    const settingsKey = constructSettingsStorageKey(key)
    await storeSecurelyWithReportableError(settingsKey, JSON.stringify(settings), true, '')
  } catch (e) {
    console.error(e)
  }
}

export const loadBiometricsSettings = async () => {
  const { usesBiometrics, requireAuth } = (await loadSettings('general')) as GeneralSettings

  return {
    biometricsRequiredForAppAccess: usesBiometrics,
    biometricsRequiredForTransactions: requireAuth
  }
}
