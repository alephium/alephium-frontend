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

import { defaultNetworkSettings, NetworkSettings, networkSettingsPresets } from '@alephium/shared'
import { merge } from 'lodash'

import { loadSettings, persistSettings } from '~/persistent-storage/settings'

export const migrateNetworkSettings = async () => {
  await _v1_0_6_networkSettingsMigration()
  await _v1_0_10_networkSettingsMigration()
}

const _v1_0_6_networkSettingsMigration = async () => {
  await migrateReleaseNetworkSettings({
    'https://wallet-v20.mainnet.alephium.org': networkSettingsPresets.mainnet.nodeHost,
    'https://wallet-v20.testnet.alephium.org': networkSettingsPresets.testnet.nodeHost
  })
}

const _v1_0_10_networkSettingsMigration = async () => {
  await migrateReleaseNetworkSettings({
    'https://node-v20.mainnet.alephium.org': networkSettingsPresets.mainnet.nodeHost,
    'https://node-v20.testnet.alephium.org': networkSettingsPresets.testnet.nodeHost,
    'https://backend-v115.mainnet.alephium.org': networkSettingsPresets.mainnet.explorerApiHost,
    'https://backend-v115.testnet.alephium.org': networkSettingsPresets.testnet.explorerApiHost
  })
}

const migrateReleaseNetworkSettings = async (migrationsMapping: Record<string, string>) => {
  const previousSettings = (await loadSettings('network')) as NetworkSettings
  const { nodeHost, explorerApiHost, explorerUrl } = previousSettings

  const migratedNetworkSettings = {
    ...previousSettings,
    nodeHost: migrationsMapping[nodeHost] ?? nodeHost,
    explorerApiHost: migrationsMapping[explorerApiHost] ?? explorerApiHost,
    explorerUrl: migrationsMapping[explorerUrl] ?? explorerUrl
  }

  const newNetworkSettings = merge({}, defaultNetworkSettings, migratedNetworkSettings)
  await persistSettings('network', newNetworkSettings)
}
