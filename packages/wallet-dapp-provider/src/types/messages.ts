import { Address, KeyType, SignMessageParams, SignUnsignedTxParams, SignUnsignedTxResult } from '@alephium/web3'

import { TransactionParams, TransactionResult } from '../types/transactions'
import { WalletAccountWithNetwork } from '../types/wallet.model'

interface HostParams {
  host: string
  icon?: string
  networkId?: string
}

export interface RequestOptions extends HostParams {
  address?: Address
  addressGroup?: number
  keyType?: KeyType
}

export interface ConnectDappMessageData extends HostParams {
  group?: number
  keyType?: KeyType
}

export type ExecuteTransactionMessageData = {
  txParams: TransactionParams[]
  icon?: string
}

export type SignMessageMessageData = SignMessageParams & HostParams

export type SignUnsignedTxMessageData = SignUnsignedTxParams & HostParams

export type MessageType = ActionMessage | PreAuthorisationMessage | TransactionMessage | AccountMessage

type PreAuthorisationMessage =
  | { type: 'ALPH_CONNECT_DAPP'; data: ConnectDappMessageData }
  | { type: 'ALPH_CONNECT_DAPP_RES'; data: WalletAccountWithNetwork }
  | { type: 'ALPH_IS_PREAUTHORIZED'; data: RequestOptions }
  | { type: 'ALPH_IS_PREAUTHORIZED_RES'; data: boolean }
  | {
      type: 'ALPH_REJECT_PREAUTHORIZATION'
      data: { host: string; actionHash: string }
    }
  | { type: 'ALPH_REMOVE_PREAUTHORIZATION'; data: string }
  | { type: 'ALPH_REMOVE_PREAUTHORIZATION_RES' }

type TransactionMessage =
  | {
      type: 'ALPH_EXECUTE_TRANSACTION'
      data: ExecuteTransactionMessageData
    }
  | { type: 'ALPH_EXECUTE_TRANSACTION_RES'; data: { actionHash: string } }
  | {
      type: 'ALPH_TRANSACTION_SUBMITTED'
      data: { result: TransactionResult[]; actionHash: string }
    }
  | {
      type: 'ALPH_TRANSACTION_FAILED'
      data: { actionHash: string; error: string }
    }

type ActionMessage =
  | { type: 'ALPH_SIGN_MESSAGE'; data: SignMessageMessageData }
  | { type: 'ALPH_SIGN_MESSAGE_RES'; data: { actionHash: string } }
  | { type: 'ALPH_SIGN_MESSAGE_FAILURE'; data: { actionHash: string; error: string } }
  | {
      type: 'ALPH_SIGN_MESSAGE_SUCCESS'
      data: { signature: string; actionHash: string }
    }
  | { type: 'ALPH_SIGN_UNSIGNED_TX'; data: SignUnsignedTxMessageData }
  | { type: 'ALPH_SIGN_UNSIGNED_TX_RES'; data: { actionHash: string } }
  | { type: 'ALPH_SIGN_UNSIGNED_TX_FAILURE'; data: { actionHash: string; error: string } }
  | { type: 'ALPH_SIGN_UNSIGNED_TX_SUCCESS'; data: { result: SignUnsignedTxResult; actionHash: string } }

type AccountMessage = { type: 'ALPH_DISCONNECT_ACCOUNT' }

export type WindowMessageType = MessageType & {
  forwarded?: boolean
  extensionId: string
}
