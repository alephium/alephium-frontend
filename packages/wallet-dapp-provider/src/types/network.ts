export interface Network {
  id: string
  name: string
  nodeUrl: string
  explorerApiUrl: string
  explorerUrl?: string
  nodeApiKey?: string
  readonly?: boolean
}
