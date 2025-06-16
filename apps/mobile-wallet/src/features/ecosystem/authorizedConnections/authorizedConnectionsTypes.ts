import { NetworkPreset } from '@alephium/shared'

export type AuthorizedConnection = {
  dateTime: number
  address: string
  host: string
  networkName?: NetworkPreset
  icon?: string
}
