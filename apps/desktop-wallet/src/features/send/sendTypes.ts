import { AssetAmount } from '@alephium/shared'
import { node } from '@alephium/web3'

import { Address } from '@/types/addresses'
import { TokenId } from '@/types/tokens'

export interface TransferTxData {
  fromAddress: Address
  toAddress: string
  assetAmounts: AssetAmount[]
  shouldSweep: boolean
  gasAmount?: number
  gasPrice?: string
  lockTime?: Date
  tokenId?: TokenId
}

export interface CallContractTxData {
  fromAddress: Address
  bytecode: string

  assetAmounts?: AssetAmount[]
  gasAmount?: number
  gasPrice?: string
}

export interface DeployContractTxData {
  fromAddress: Address
  bytecode: string

  initialAlphAmount?: AssetAmount
  issueTokenAmount?: string
  gasAmount?: number
  gasPrice?: string
}

export type TxData = TransferTxData | CallContractTxData | DeployContractTxData

export type TransferTxModalData = PartialTxData<TransferTxData, 'fromAddress'>
export type CallContractTxModalData = PartialTxData<CallContractTxData, 'fromAddress'>
export type DeployContractTxModalData = PartialTxData<DeployContractTxData, 'fromAddress'>

export type TransferAddressesTxModalOnSubmitData = PartialTxData<
  TransferTxData,
  'fromAddress' | 'toAddress' | 'tokenId'
>

export type AddressesTxModalData =
  | TransferAddressesTxModalOnSubmitData
  | DeployContractTxModalData
  | CallContractTxModalData

export interface TxPreparation {
  fromAddress: Address
  bytecode?: string
  issueTokenAmount?: string
  alphAmount?: string
}

export type PartialTxData<T, K extends keyof T> = {
  [P in keyof Omit<T, K>]?: T[P]
} & Pick<T, K>

export type CheckTxProps<T> = {
  data: T
  fees: bigint
  onSubmit: () => void
}

export type UnsignedTx = {
  fromGroup: number
  toGroup: number
  unsignedTx: string
  gasAmount: number
  gasPrice: string
}

export type TxContext = {
  setIsSweeping: (isSweeping: boolean) => void
  sweepUnsignedTxs: node.SweepAddressTransaction[]
  setSweepUnsignedTxs: (txs: node.SweepAddressTransaction[]) => void
  setFees: (fees: bigint | undefined) => void
  unsignedTransaction: UnsignedTx | undefined
  setUnsignedTransaction: (tx: UnsignedTx | undefined) => void
  unsignedTxId: string
  setUnsignedTxId: (txId: string) => void
  setContractAddress: (contractAddress: string) => void
  isSweeping: boolean
  consolidationRequired: boolean
  buildExecuteScriptTxResult: node.BuildExecuteScriptTxResult | undefined
  setBuildExecuteScriptTxResult: (tx: node.BuildExecuteScriptTxResult | undefined) => void
}
