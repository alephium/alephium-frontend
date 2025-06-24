import { Address, AssetAmount, TokenId } from '@alephium/shared'

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

export type TransferTxModalData = PartialTxData<TransferTxData, 'fromAddress'>

export type TransferAddressesTxModalOnSubmitData = PartialTxData<
  TransferTxData,
  'fromAddress' | 'toAddress' | 'tokenId'
>

export type PartialTxData<T, K extends keyof T> = {
  [P in keyof Omit<T, K>]?: T[P]
} & Pick<T, K>

export type CheckTxProps<T> = {
  data: T
  fees: bigint
  onSubmit: () => void
  onBack: () => void
  dAppUrl?: string
}

export type UnsignedTx = {
  fromGroup: number
  toGroup: number
  unsignedTx: string
  gasAmount: number
  gasPrice: string
}
