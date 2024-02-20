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

import { clone } from 'lodash'

import { NetworkName, NetworkNames, NetworkPreset, NetworkSettings } from '@/types/network'

export const networkSettingsPresets: Record<NetworkPreset, NetworkSettings> = {
  [NetworkNames.mainnet]: {
    networkId: 0,
    nodeHost: 'https://node-v20.mainnet.alephium.org',
    explorerApiHost: 'https://backend-v115.mainnet.alephium.org',
    explorerUrl: 'https://explorer.alephium.org'
  },
  [NetworkNames.testnet]: {
    networkId: 1,
    nodeHost: 'https://node-v20.testnet.alephium.org',
    explorerApiHost: 'https://backend-v115.testnet.alephium.org',
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
