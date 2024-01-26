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

import { AddressHash, AssetAmount } from '@alephium/shared'
import { explorer, SignMessageParams } from '@alephium/web3'

import { Address } from '~/types/addresses'

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
