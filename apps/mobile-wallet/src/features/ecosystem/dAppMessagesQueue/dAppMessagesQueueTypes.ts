import { MessageType } from '@alephium/wallet-dapp-provider'

export type DappMessage = MessageType & {
  id: number
}
