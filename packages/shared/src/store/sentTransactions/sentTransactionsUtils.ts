import { ALPH } from '@alephium/token-list'
import type {
  SignDeployContractTxParams,
  SignDeployContractTxResult,
  SignExecuteScriptTxParams,
  SignExecuteScriptTxResult,
  SignTransferTxParams,
  SignTransferTxResult,
  SubmissionResult
} from '@alephium/web3'

import { calculateTransferTxAssetAmounts } from '@/transactions'
import { SentTransaction, SweepTxParams } from '@/types/transactions'

type SignAndSubmitTxResultToSentTxProps =
  | {
      type: 'TRANSFER'
      txParams: SignTransferTxParams
      result: SignTransferTxResult
    }
  | {
      type: 'EXECUTE_SCRIPT'
      txParams: SignExecuteScriptTxParams
      result: SignExecuteScriptTxResult
    }
  | {
      type: 'DEPLOY_CONTRACT'
      txParams: SignDeployContractTxParams
      result: SignDeployContractTxResult
    }
  | {
      type: 'SWEEP'
      txParams: SweepTxParams
      result: Pick<SubmissionResult, 'txId'>
    }

export const signAndSubmitTxResultToSentTx = ({
  txParams,
  type,
  result
}: SignAndSubmitTxResultToSentTxProps): SentTransaction => {
  switch (type) {
    case 'TRANSFER': {
      const assetAmounts = calculateTransferTxAssetAmounts(txParams)
      return {
        hash: result.txId,
        fromAddress: txParams.signerAddress,
        toAddress: txParams.destinations[0].address, // TODO: Improve display for multiple destinations
        lockTime: txParams.destinations[0].lockTime,
        amount: assetAmounts.find(({ id }) => id === ALPH.id)?.amount?.toString(),
        tokens: assetAmounts
          .filter(({ id }) => id !== ALPH.id)
          .map(({ id, amount }) => ({ id, amount: amount.toString() })),
        timestamp: new Date().getTime(),
        status: 'sent',
        type: 'transfer'
      }
    }
    case 'EXECUTE_SCRIPT':
      return {
        hash: result.txId,
        fromAddress: txParams.signerAddress,
        amount: txParams.attoAlphAmount ? txParams.attoAlphAmount.toString() : undefined,
        tokens: txParams.tokens
          ? txParams.tokens.map((token) => ({ id: token.id, amount: token.amount.toString() }))
          : undefined,
        timestamp: new Date().getTime(),
        status: 'sent',
        type: 'contract',
        toAddress: ''
      }
    case 'DEPLOY_CONTRACT':
      return {
        hash: result.txId,
        fromAddress: txParams.signerAddress,
        timestamp: new Date().getTime(),
        status: 'sent',
        type: 'contract',
        toAddress: ''
      }
    case 'SWEEP':
      return {
        hash: result.txId,
        fromAddress: txParams.signerAddress,
        toAddress: txParams.toAddress,
        lockTime: txParams.lockTime,
        timestamp: new Date().getTime(),
        status: 'sent',
        type: 'sweep'
      }
    default: {
      throw new Error(`Unsupported transaction type: ${type}`)
    }
  }
}
