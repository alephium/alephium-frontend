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

import { NetworkPreset, NetworkName } from '../types/network'
import { GeneralSettings, NetworkSettings, SettingsKey, SettingsPartial } from '../types/settings'

const STORAGE_KEY = 'wallet-settings'

export const networkPresetSettings: Record<NetworkPreset, NetworkSettings> = {
  [NetworkName.mainnet]: {
    nodeHost: 'https://mainnet-wallet.alephium.org',
    explorerApiHost: 'https://mainnet-backend.alephium.org',
    explorerUrl: 'https://explorer.alephium.org'
  },
  [NetworkName.testnet]: {
    nodeHost: 'https://testnet-wallet.alephium.org',
    explorerApiHost: 'https://testnet-backend.alephium.org',
    explorerUrl: 'https://testnet.alephium.org'
  },
  [NetworkName.localhost]: {
    nodeHost: 'http://localhost:12973',
    explorerApiHost: 'http://localhost:9090',
    explorerUrl: 'http://localhost:3000'
  }
}

export const defaultNetwork = NetworkName.testnet

export const defaultGeneralSettings: GeneralSettings = {
  theme: 'light',
  walletLockTimeInMinutes: 3,
  discreetMode: false,
  passwordRequirement: false
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

    return JSON.parse(rawSettings) as SettingsPartial
  } catch (e) {
    console.error(e)
    return defaultSettings[key] // Fallback to default settings if something went wrong
  }
}

export const storeSettings = async (key: SettingsKey, settings: SettingsPartial) => {
  try {
    await AsyncStorage.setItem(constructSettingsStorageKey(key), JSON.stringify(settings))
  } catch (e) {
    console.error(e)
  }
}
