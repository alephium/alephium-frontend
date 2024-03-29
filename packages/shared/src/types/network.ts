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

export interface NetworkSettings {
  networkId: number
  nodeHost: string
  explorerApiHost: string
  explorerUrl: string
  proxy?: ProxySettings
}

export interface ProxySettings {
  address?: string
  port?: string
}

export type NetworkStatus = 'offline' | 'connecting' | 'online' | 'uninitialized'

export enum NetworkNames {
  mainnet = 'mainnet',
  testnet = 'testnet',
  devnet = 'devnet',
  custom = 'custom'
}

export type NetworkName = keyof typeof NetworkNames

export type NetworkPreset = Exclude<NetworkName, 'custom'>

export interface NetworkState {
  name: NetworkName
  settings: NetworkSettings
  status: NetworkStatus
}
