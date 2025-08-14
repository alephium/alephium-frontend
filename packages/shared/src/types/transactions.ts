import {
  explorer as e,
  KeyType,
  node as n,
  Optional,
  SignDeployContractTxParams,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignTransferTxParams,
  SignUnsignedTxParams
} from '@alephium/web3'
import { EntityState } from '@reduxjs/toolkit'

import { Address, AddressHash } from '@/types/addresses'
import { Asset, AssetAmount, TokenId } from '@/types/assets'

export type TransactionInfoAsset = Optional<Omit<Asset, 'balance' | 'lockedBalance'>, 'decimals'> &
  Required<AssetAmount>

export type TransactionInfo = {
  assets: TransactionInfoAsset[]
  direction: TransactionDirection
  infoType: TransactionInfoType
  lockTime?: Date
}

export type TransactionDirection = 'out' | 'in' | 'swap'

export type TransactionInfoType = TransactionDirection | 'move' | 'moveGroup' | 'pending'

export type AmountDeltas = {
  alphAmount: bigint
  tokenAmounts: {
    id: e.Token['id']
    amount: bigint
  }[]
  fee: bigint
}

export type SentTransaction = {
  hash: string
  fromAddress: string
  toAddress: string
  timestamp: number
  type: 'consolidation' | 'transfer' | 'sweep' | 'contract' | 'faucet'
  amount?: string
  tokens?: e.Token[]
  lockTime?: number
  status: 'sent' | 'mempooled' | 'confirmed'
}

export type SentTransactionsState = EntityState<SentTransaction>

export const isGrouplessTxResult = (
  txResult:
    | n.BuildSimpleTransferTxResult
    | n.BuildGrouplessTransferTxResult
    | n.BuildSimpleExecuteScriptTxResult
    | n.BuildGrouplessExecuteScriptTxResult
    | n.BuildSimpleDeployContractTxResult
    | n.BuildGrouplessDeployContractTxResult
): txResult is
  | n.BuildGrouplessTransferTxResult
  | n.BuildGrouplessExecuteScriptTxResult
  | n.BuildGrouplessDeployContractTxResult => 'transferTxs' in txResult

export interface SweepTxParams extends Omit<n.BuildSweepAddressTransactions, 'fromPublicKey' | 'fromPublicKeyType'> {
  signerAddress: string
  signerKeyType: KeyType
}

export interface SendFlowData {
  fromAddress: Address
  toAddress: string
  assetAmounts: AssetAmount[]
  gasAmount?: number
  gasPrice?: string
  lockTime?: Date
  tokenId?: TokenId
}

export type TransactionParams =
  | {
      type: 'TRANSFER'
      params: SignTransferTxParams
    }
  | {
      type: 'DEPLOY_CONTRACT'
      params: SignDeployContractTxParams
    }
  | {
      type: 'EXECUTE_SCRIPT'
      params: SignExecuteScriptTxParams
    }
  | {
      type: 'UNSIGNED_TX'
      params: SignUnsignedTxParams
    }

export type TransactionView = 'address' | 'wallet'

export type UseTransactionProps = {
  tx: e.Transaction | e.PendingTransaction | SentTransaction | ExecuteScriptTx
  referenceAddress: AddressHash
  view: TransactionView
}

export type ExecuteScriptTx = Pick<SignExecuteScriptTxResult, 'gasAmount' | 'gasPrice' | 'txId' | 'simulationResult'>
