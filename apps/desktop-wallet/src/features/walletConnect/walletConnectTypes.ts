import { Address } from '@alephium/shared'
import { SignMessageParams } from '@alephium/web3'

import { CallContractTxData, TransferTxData } from '@/features/send/sendTypes'

export enum TxType {
  TRANSFER,
  SIGN_UNSIGNED_TX,
  SIGN_MESSAGE,
  SCRIPT
}

export type TxDataToModalType =
  | {
      modalType: TxType.TRANSFER
      txData: TransferTxData
    }
  | {
      modalType: TxType.SIGN_UNSIGNED_TX
      txData: SignUnsignedTxData
    }
  | {
      modalType: TxType.SIGN_MESSAGE
      txData: SignMessageData
    }
  | {
      modalType: TxType.SCRIPT
      txData: CallContractTxData
    }

export type DappTxData = TransferTxData | CallContractTxData | SignUnsignedTxData | SignMessageData

export interface SignUnsignedTxData {
  fromAddress: Address
  unsignedTx: string
}

export interface SignMessageData extends Pick<SignMessageParams, 'message' | 'messageHasher'> {
  fromAddress: Address
}
