/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

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
