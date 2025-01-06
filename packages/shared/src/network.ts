import { clone } from 'lodash'

import { NetworkName, NetworkNames, NetworkPreset, NetworkSettings } from '@/types/network'

export const networkSettingsPresets: Record<NetworkPreset, NetworkSettings> = {
  [NetworkNames.mainnet]: {
    networkId: 0,
    nodeHost: 'https://node.mainnet.alephium.org',
    explorerApiHost: 'https://backend.mainnet.alephium.org',
    explorerUrl: 'https://explorer.alephium.org'
  },
  [NetworkNames.testnet]: {
    networkId: 1,
    nodeHost: 'https://node.testnet.alephium.org',
    explorerApiHost: 'https://backend.testnet.alephium.org',
    explorerUrl: 'https://testnet.alephium.org'
  },
  [NetworkNames.devnet]: {
    networkId: 4,
    nodeHost: 'http://localhost:22973',
    explorerApiHost: 'http://localhost:9090',
    explorerUrl: 'http://localhost:23000'
  }
}

export const defaultNetworkSettings = clone(networkSettingsPresets.mainnet) as NetworkSettings

export const isEqualNetwork = (a: NetworkSettings, b: NetworkSettings): boolean =>
  a.nodeHost === b.nodeHost && a.explorerUrl === b.explorerUrl && a.explorerApiHost === b.explorerApiHost

export const getNetworkName = (settings: NetworkSettings) =>
  (Object.entries(networkSettingsPresets).find(([, presetSettings]) => isEqualNetwork(presetSettings, settings))?.[0] ||
    'custom') as NetworkName | 'custom'
