import { AddressHash, AssetAmount, DEPRECATED_Address as Address } from '@alephium/shared'
import { explorer, SignMessageParams, SignUnsignedTxParams } from '@alephium/web3'

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

export interface CallContractTxData {
  fromAddress: AddressHash
  bytecode: string

  assetAmounts?: AssetAmount[]
  gasAmount?: number
  gasPrice?: string
}

export interface DeployContractTxData {
  fromAddress: AddressHash
  bytecode: string

  initialAlphAmount?: AssetAmount
  issueTokenAmount?: string
  gasAmount?: number
  gasPrice?: string
}

export interface SignMessageData extends Pick<SignMessageParams, 'message' | 'messageHasher'> {
  fromAddress: AddressHash
}

export interface SignUnsignedTxData extends Pick<SignUnsignedTxParams, 'signerKeyType' | 'unsignedTx'> {
  fromAddress: AddressHash
}
