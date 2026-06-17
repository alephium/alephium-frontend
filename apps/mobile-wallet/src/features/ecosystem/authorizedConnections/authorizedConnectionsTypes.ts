import { NetworkPreset } from '@alephium/shared/types'

export type AuthorizedConnection = {
  dateTime: number
  address: string
  host: string
  networkName?: NetworkPreset
  icon?: string
}
