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
import AsyncStorage from '@react-native-async-storage/async-storage'
import { clone } from 'lodash'

import { Settings } from '../types/settings'
import { networkEndpoints } from '../utils/settings'

const STORAGE_KEY = 'wallet-settings'

export const defaultSettings: Settings = {
  general: {
    theme: 'light',
    walletLockTimeInMinutes: 3,
    discreetMode: false,
    passwordRequirement: false
  },
  network: clone(networkEndpoints.testnet)
}

export const loadSettings = async (): Promise<Settings> => {
  try {
    const rawSettings = await AsyncStorage.getItem(STORAGE_KEY)
    if (!rawSettings) return defaultSettings

    return JSON.parse(rawSettings) as Settings
  } catch (e) {
    console.error(e)
    return defaultSettings // Fallback to default settings if something went wrong
  }
}

export const storeSettings = async (settings: Settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (e) {
    console.error(e)
  }
}

type UpdateSettingsFunctionSignature = <T extends keyof Settings>(
  settingKeyToUpdate: T,
  newSettings: Partial<Settings[T]>
) => Promise<Settings | null>

export const updateStoredSettings: UpdateSettingsFunctionSignature = async (
  settingKeyToUpdate,
  settings
): Promise<Settings> => {
  const previousSettings = await loadSettings()

  const newSettings = {
    ...previousSettings,
    [settingKeyToUpdate]: {
      ...previousSettings[settingKeyToUpdate],
      ...settings
    }
  } as Settings

  await storeSettings(newSettings)

  return newSettings
}
