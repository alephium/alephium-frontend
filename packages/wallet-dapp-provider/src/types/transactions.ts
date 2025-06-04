import {
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignTransferTxParams,
  SignTransferTxResult,
  SignUnsignedTxParams,
  SignUnsignedTxResult
} from '@alephium/web3'

interface OptionalBuiltTransaction {
  networkId: string
  unsignedTx?: string
  txId?: string
  host?: string
}

export type TransactionPayload<T> = T & OptionalBuiltTransaction

export type TransactionParams = (
  | {
      type: 'TRANSFER'
      params: TransactionPayload<SignTransferTxParams>
    }
  | {
      type: 'DEPLOY_CONTRACT'
      params: TransactionPayload<SignDeployContractTxParams>
    }
  | {
      type: 'EXECUTE_SCRIPT'
      params: TransactionPayload<SignExecuteScriptTxParams>
    }
  | {
      type: 'UNSIGNED_TX'
      params: TransactionPayload<SignUnsignedTxParams>
    }
) & {
  salt: string // to avoid hash collision for queue items
}

export type TransactionResult =
  | {
      type: 'TRANSFER'
      result: SignTransferTxResult
    }
  | {
      type: 'DEPLOY_CONTRACT'
      result: SignDeployContractTxResult
    }
  | {
      type: 'EXECUTE_SCRIPT'
      result: SignExecuteScriptTxResult
    }
  | {
      type: 'UNSIGNED_TX'
      result: SignUnsignedTxResult
    }
