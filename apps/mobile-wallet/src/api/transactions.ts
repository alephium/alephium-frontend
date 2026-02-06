import {
  signAndSubmitTxResultToSentTx,
  SignChainedTxModalResult,
  signChainedTxResultsToTxSubmittedResults,
  SweepTxParams,
  throttledClient,
  transactionSent
} from '@alephium/shared'
import {
  BuildTxResult,
  SignChainedTxParams,
  SignTransferTxParams,
  SignTransferTxResult,
  SubmissionResult
} from '@alephium/web3'

import { signer } from '~/signer'
import { store } from '~/store/store'

export const fetchSweepTransactionsFees = async (txParams: SweepTxParams): Promise<bigint> => {
  const { unsignedTxs } = await throttledClient.txBuilder.buildSweepTxs(
    txParams,
    await signer.getPublicKey(txParams.signerAddress)
  )

  return unsignedTxs.reduce((acc, tx) => acc + BigInt(tx.gasPrice) * BigInt(tx.gasAmount), BigInt(0))
}

export const fetchTransferTransactionsFees = async (txParams: SignTransferTxParams): Promise<bigint> => {
  console.log({ txParams: JSON.stringify(txParams, null, 2) })
  const pub = await signer.getPublicKey(txParams.signerAddress)

  console.log({ pub })

  const { gasAmount, gasPrice } = await throttledClient.txBuilder.buildTransferTx(
    txParams,
    await signer.getPublicKey(txParams.signerAddress)
  )

  console.log({ gasAmount })

  return BigInt(gasAmount) * BigInt(gasPrice)
}

export const fetchTransferUnsignedTx = async (
  txParams: SignTransferTxParams
): Promise<BuildTxResult<SignTransferTxResult>> => {
  console.log({ txParams: JSON.stringify(txParams, null, 2) })
  const pub = await signer.getPublicKey(txParams.signerAddress)

  console.log({ pub })

  return await throttledClient.txBuilder.buildTransferTx(txParams, await signer.getPublicKey(txParams.signerAddress))
}

export const sendChainedTransactions = async (
  txParams: Array<SignChainedTxParams>
): Promise<SignChainedTxModalResult> => {
  const data = await signer.signAndSubmitChainedTx(txParams)
  const results = signChainedTxResultsToTxSubmittedResults(data, txParams)

  results.forEach((result) => {
    const sentTx = signAndSubmitTxResultToSentTx(result)
    store.dispatch(transactionSent(sentTx))
  })

  return results
}

export const sendSweepTransactions = async (txParams: SweepTxParams): Promise<Array<SubmissionResult>> => {
  const results = await signer.signAndSubmitSweepTxs(txParams)

  for (const result of results) {
    const sentTx = signAndSubmitTxResultToSentTx({ txParams, result, type: 'SWEEP' })
    store.dispatch(transactionSent(sentTx))
  }

  return results
}

export const sendTransferTransactions = async (txParams: SignTransferTxParams): Promise<SignTransferTxResult> => {
  const result = await signer.signAndSubmitTransferTx(txParams)

  const sentTx = signAndSubmitTxResultToSentTx({ txParams, result, type: 'TRANSFER' })
  store.dispatch(transactionSent(sentTx))

  return result
}
