import { SendFlowData, SignChainedTxModalProps } from '@alephium/shared'

export type TransferTxModalData = PartialTxData<SendFlowData, 'fromAddress'>

export type TransferAddressesTxModalOnSubmitData = PartialTxData<SendFlowData, 'fromAddress' | 'toAddress' | 'tokenId'>

export type PartialTxData<T, K extends keyof T> = {
  [P in keyof Omit<T, K>]?: T[P]
} & Pick<T, K>

export type CheckTxProps = {
  data: SendFlowData
  fees: bigint
  onSubmit: () => void
  onBack: () => void
  dAppUrl?: string
  chainedTxProps?: SignChainedTxModalProps['props']
}

export type UnsignedTx = {
  fromGroup: number
  toGroup: number
  unsignedTx: string
  gasAmount: number
  gasPrice: string
}
