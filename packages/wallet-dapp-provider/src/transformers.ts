import {
  SignChainedTxParams,
  SignChainedTxResult,
  SignDeployContractChainedTxResult,
  SignExecuteScriptChainedTxResult,
  SignTransferChainedTxResult
} from '@alephium/web3'

import { TransactionParams, TransactionResult } from './types/transactions'

export function signedChainedTxParamsToTransactionParams(
  signedChainedTxParams: SignChainedTxParams,
  networkId: string
): TransactionParams {
  const paramsType = signedChainedTxParams.type
  const salt = Date.now().toString()
  switch (paramsType) {
    case 'Transfer':
      return {
        type: 'TRANSFER',
        params: { networkId, ...signedChainedTxParams },
        salt
      }
    case 'DeployContract':
      return {
        type: 'DEPLOY_CONTRACT',
        params: { networkId, ...signedChainedTxParams },
        salt
      }
    case 'ExecuteScript':
      return {
        type: 'EXECUTE_SCRIPT',
        params: { networkId, ...signedChainedTxParams },
        salt
      }
    default:
      throw new Error(`Unsupported transaction type: ${paramsType}`)
  }
}

export function transactionResultToSignUnsignedTxResult(txResult: TransactionResult): SignChainedTxResult {
  const txResultType = txResult.type
  switch (txResultType) {
    case 'TRANSFER':
      return { type: 'Transfer', ...txResult.result } as SignTransferChainedTxResult
    case 'DEPLOY_CONTRACT':
      return { type: 'DeployContract', ...txResult.result } as SignDeployContractChainedTxResult
    case 'EXECUTE_SCRIPT':
      return { type: 'ExecuteScript', ...txResult.result } as SignExecuteScriptChainedTxResult
    default:
      throw new Error(`Unsupported transaction type: ${txResultType}`)
  }
}
