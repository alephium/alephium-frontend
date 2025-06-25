import { Address, AddressHash, AssetAmount } from '@alephium/shared'
import { explorer, SignExecuteScriptTxParams, SignMessageParams, SignTransferTxParams } from '@alephium/web3'

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

// TODO: Support multiple destinations
export interface SignTransferTxParamsSingleDestination extends SignTransferTxParams {
  toAddress: AddressHash
  assetAmounts: AssetAmount[]
  lockTime?: Date
}

export interface SignExecuteScriptTxParamsWithAmounts extends SignExecuteScriptTxParams {
  assetAmounts: AssetAmount[]
}

export interface SignMessageData extends Pick<SignMessageParams, 'message' | 'messageHasher'> {
  fromAddress: AddressHash
}
