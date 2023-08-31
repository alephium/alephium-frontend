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
import { Appearance } from 'react-native'

import { NetworkName, NetworkPreset } from '~/types/network'
import { GeneralSettings, NetworkSettings, SettingsKey, SettingsPartial } from '~/types/settings'

const STORAGE_KEY = 'wallet-settings'

export const networkPresetSettings: Record<NetworkPreset, NetworkSettings> = {
  [NetworkName.mainnet]: {
    networkId: 0,
    nodeHost: 'https://wallet-v20.mainnet.alephium.org',
    explorerApiHost: 'https://backend-v115.mainnet.alephium.org',
    explorerUrl: 'https://explorer.alephium.org'
  },
  [NetworkName.testnet]: {
    networkId: 1,
    nodeHost: 'https://wallet-v20.testnet.alephium.org',
    explorerApiHost: 'https://backend-v115.testnet.alephium.org',
    explorerUrl: 'https://testnet.alephium.org'
  }
}

export const defaultNetwork = NetworkName.testnet

export const defaultGeneralSettings: GeneralSettings = {
  theme: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
  discreetMode: false,
  requireAuth: false,
  currency: 'USD',
  analytics: true,
  analyticsId: undefined
}

export const defaultNetworkSettings: NetworkSettings = clone(networkPresetSettings[defaultNetwork])

const defaultSettings = {
  general: defaultGeneralSettings,
  network: defaultNetworkSettings
}

const constructSettingsStorageKey = (key: SettingsKey) => `${STORAGE_KEY}-${key}`

export const loadSettings = async (key: SettingsKey): Promise<SettingsPartial> => {
  try {
    const rawSettings = await AsyncStorage.getItem(constructSettingsStorageKey(key))
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
    await AsyncStorage.setItem(constructSettingsStorageKey(key), JSON.stringify(settings))
  } catch (e) {
    console.error(e)
  }
}
