import { Address, AddressHash, AssetAmount } from '@alephium/shared'
import { explorer, SignExecuteScriptTxParams, SignMessageParams, SignUnsignedTxParams } from '@alephium/web3'

export type PendingTransaction =
  | {
      hash: string
      fromAddress: string
      toAddress: string
      timestamp: number
      amount?: string
      tokens?: explorer.Token[]
      lockTime?: number
      status: 'pending'
      type: 'transfer'
    }
  | {
      hash: string
      fromAddress: string
      timestamp: number
      amount?: string
      tokens?: explorer.Token[]
      lockTime?: number
      status: 'pending'
      type: 'call-contract'
    }
  | {
      hash: string
      fromAddress: string
      timestamp: number
      amount?: string
      tokens?: explorer.Token[]
      lockTime?: number
      status: 'pending'
      type: 'deploy-contract'
    }

export type AddressConfirmedTransaction = explorer.Transaction & { address: Address }
export type AddressPendingTransaction = PendingTransaction & { address: Address }
export type AddressTransaction = AddressConfirmedTransaction | AddressPendingTransaction

export enum TxType {
  TRANSFER,
  DEPLOY_CONTRACT,
  SCRIPT
}

export interface TransferTxData {
  fromAddress: AddressHash
  toAddress: AddressHash
  assetAmounts: AssetAmount[]
  gasAmount?: number
  gasPrice?: string
  lockTime?: Date
}

export interface SignExecuteScriptTxParamsWithAmounts extends SignExecuteScriptTxParams {
  assetAmounts: AssetAmount[]
}

export interface SignMessageData extends Pick<SignMessageParams, 'message' | 'messageHasher'> {
  fromAddress: AddressHash
}

export interface SignUnsignedTxData extends Pick<SignUnsignedTxParams, 'signerKeyType' | 'unsignedTx'> {
  fromAddress: AddressHash
}
