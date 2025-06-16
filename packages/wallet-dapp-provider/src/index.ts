import { announceProvider, attachAlephiumProvider } from './provider'
import { ConnectDappMessageData, ExecuteTransactionMessageData, MessageType, RequestOptions } from './types/messages'
import { TransactionParams, TransactionResult } from './types/transactions'
import { BaseWalletAccount, WalletAccountWithNetwork } from './types/wallet.model'

export const attach = () => {
  announceProvider()
  attachAlephiumProvider()
}

export type {
  MessageType,
  RequestOptions,
  BaseWalletAccount,
  ConnectDappMessageData,
  ExecuteTransactionMessageData,
  WalletAccountWithNetwork,
  TransactionParams,
  TransactionResult
}
