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
  const { usesBiometrics } = (await loadSettings('general')) as GeneralSettings

  return usesBiometrics
}
