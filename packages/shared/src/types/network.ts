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
  nodeStatus: NetworkStatus
  explorerStatus: NetworkStatus
}
