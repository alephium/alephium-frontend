import { announceProvider, attachAlephiumProvider } from './provider'
import { ConnectDappMessageData, MessageType, RequestOptions } from './types/messages'
import { BaseWalletAccount, WalletAccountWithNetwork } from './types/wallet.model'

export const attach = () => {
  announceProvider()
  attachAlephiumProvider()
}

export type { MessageType, RequestOptions, BaseWalletAccount, ConnectDappMessageData, WalletAccountWithNetwork }
