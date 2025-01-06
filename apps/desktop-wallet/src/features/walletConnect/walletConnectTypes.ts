import { SignMessageParams } from '@alephium/web3'

import { CallContractTxData, DeployContractTxData, TransferTxData } from '@/features/send/sendTypes'
import { Address } from '@/types/addresses'

export enum TxType {
  TRANSFER,
  DEPLOY_CONTRACT,
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
      modalType: TxType.DEPLOY_CONTRACT
      txData: DeployContractTxData
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

export type DappTxData =
  | TransferTxData
  | DeployContractTxData
  | CallContractTxData
  | SignUnsignedTxData
  | SignMessageData

export interface SignUnsignedTxData {
  fromAddress: Address
  unsignedTx: string
}

export interface SignMessageData extends Pick<SignMessageParams, 'message' | 'messageHasher'> {
  fromAddress: Address
}
