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

import { isEqual } from 'lodash'

import { NetworkType, Settings } from '../types/settings'

export const networkEndpoints: Record<Exclude<keyof typeof NetworkType, 'custom'>, Settings['network']> = {
  mainnet: {
    nodeHost: 'https://mainnet-wallet.alephium.org',
    explorerApiHost: 'https://mainnet-backend.alephium.org',
    explorerUrl: 'https://explorer.alephium.org'
  },
  testnet: {
    nodeHost: 'https://testnet-wallet.alephium.org',
    explorerApiHost: 'https://testnet-backend.alephium.org',
    explorerUrl: 'https://testnet.alephium.org'
  },
  localhost: {
    nodeHost: 'http://localhost:12973',
    explorerApiHost: 'http://localhost:9090',
    explorerUrl: 'http://localhost:3000'
  }
}

export const getNetworkName = (settings: Settings['network']) => {
  return (Object.entries(networkEndpoints).find(([, presetSettings]) => {
    return isEqual(presetSettings, settings)
  })?.[0] || NetworkType.custom) as NetworkType
}
