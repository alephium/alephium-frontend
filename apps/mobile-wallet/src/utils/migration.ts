import { defaultNetworkSettings, NetworkSettings, networkSettingsPresets } from '@alephium/shared'
import { merge } from 'lodash'

import { loadSettings, persistSettings } from '~/features/settings/settingsPersistentStorage'

export const migrateNetworkSettings = async () => {
  await _v1_0_6_networkSettingsMigration()
  await _v1_0_10_networkSettingsMigration()
  await _v1_1_0_networkSettingsMigration()
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

const _v1_1_0_networkSettingsMigration = async () => {
  await migrateReleaseNetworkSettings({
    'https://node-v210.mainnet.alephium.org': networkSettingsPresets.mainnet.nodeHost,
    'https://node-v210.testnet.alephium.org': networkSettingsPresets.testnet.nodeHost,
    'https://backend-v117.mainnet.alephium.org': networkSettingsPresets.mainnet.explorerApiHost,
    'https://backend-v117.testnet.alephium.org': networkSettingsPresets.testnet.explorerApiHost
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
