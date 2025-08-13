import { SendFlowData, SignChainedTxModalProps } from '@alephium/shared'

export type TransferTxModalData = PartialTxData<SendFlowData, 'fromAddress'>

export type TransferAddressesTxModalOnSubmitData = PartialTxData<SendFlowData, 'fromAddress' | 'toAddress' | 'tokenId'>

export type PartialTxData<T, K extends keyof T> = {
  [P in keyof Omit<T, K>]?: T[P]
} & Pick<T, K>

export type CheckTransferTxProps = {
  data: SendFlowData
  fees: bigint
  onSubmit: () => void
  onBack: () => void
  dAppUrl?: string
}

export type CheckChainedTxProps = {
  data: SendFlowData
  onSubmit: () => void
  onBack: () => void
  dAppUrl?: string
  chainedTxProps: SignChainedTxModalProps['props']
}

export type CheckTxProps = CheckTransferTxProps | CheckChainedTxProps

export const isChainedTxProps = (props: CheckTxProps): props is CheckChainedTxProps => 'chainedTxProps' in props

export type UnsignedTx = {
  fromGroup: number
  toGroup: number
  unsignedTx: string
  gasAmount: number
  gasPrice: string
}
