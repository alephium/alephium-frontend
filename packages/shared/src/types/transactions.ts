import { explorer as e, node as n, Optional } from '@alephium/web3'
import { EntityState } from '@reduxjs/toolkit'

import { Asset, AssetAmount } from '@/types/assets'

export type TransactionInfoAsset = Optional<Omit<Asset, 'balance' | 'lockedBalance'>, 'decimals'> &
  Required<AssetAmount>

export type TransactionInfo = {
  assets: TransactionInfoAsset[]
  direction: TransactionDirection
  infoType: TransactionInfoType
  lockTime?: Date
}

export type TransactionDirection = 'out' | 'in' | 'swap'

export type TransactionInfoType = TransactionDirection | 'move' | 'pending'

export type AmountDeltas = {
  alphAmount: bigint
  tokenAmounts: {
    id: e.Token['id']
    amount: bigint
  }[]
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
