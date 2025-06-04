export interface Network {
  id: string
  name: string
  nodeUrl: string
  explorerApiUrl: string
  explorerUrl?: string
  nodeApiKey?: string
  readonly?: boolean
}

export interface NetworkStatus {
  id: Network['id']
  healthy: boolean
}
