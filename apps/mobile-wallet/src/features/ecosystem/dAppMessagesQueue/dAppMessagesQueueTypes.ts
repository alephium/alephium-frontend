import { MessageType } from '@alephium/wallet-dapp-provider'

export type DappMessage = MessageType & {
  id: string
  // Real origin host of the page that sent the message (derived natively from the WebView event, not the message
  // body). Undefined only when it could not be determined (e.g. about:blank / blocked non-https scheme), in which
  // case the message is rejected without acting on it.
  senderHost?: string
}
