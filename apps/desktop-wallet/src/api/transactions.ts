import {
  Address,
  AddressHash,
  isGrouplessKeyType,
  signAndSubmitTxResultToSentTx,
  SweepTxParams,
  throttledClient,
  transactionSent
} from '@alephium/shared'
import { SignTransferTxParams, SignTransferTxResult } from '@alephium/web3'

import { LedgerTxParams, signer } from '@/signer'
import { store } from '@/storage/store'
import { CsvExportQueryParams } from '@/types/transactions'

export const buildSweepTransactions = async (signerAddress: Address, toAddress: AddressHash) => {
  const { unsignedTxs } = await throttledClient.txBuilder.buildSweepTxs(
    { signerAddress: signerAddress.hash, signerKeyType: signerAddress.keyType, toAddress },
    await signer.getPublicKey(signerAddress.hash)
  )

  return {
    unsignedTxs,
    fees: unsignedTxs.reduce((acc, tx) => acc + BigInt(tx.gasPrice) * BigInt(tx.gasAmount), BigInt(0))
  }
}

export const fetchCsv = async ({ addressHash, ...timeRangeQueryParams }: CsvExportQueryParams) =>
  await throttledClient.explorer.addresses.getAddressesAddressExportTransactionsCsv(addressHash, timeRangeQueryParams, {
    format: 'text'
  })

export const sendSweepTransactions = async (
  txParams: SweepTxParams,
  isLedger: boolean,
  ledgerTxParams: Omit<LedgerTxParams, 'signerKeyType'>
) => {
  let results: Array<{ txId: string }>

  if (isLedger) {
    if (isGrouplessKeyType(txParams.signerKeyType)) throw Error('Groupless address not supported on Ledger')

    results = await signer.signAndSubmitSweepTxsLedger(txParams, {
      ...ledgerTxParams,
      signerKeyType: txParams.signerKeyType ?? 'default'
    })
  } else {
    results = await signer.signAndSubmitSweepTxs(txParams)
  }

  for (const result of results) {
    const sentTx = signAndSubmitTxResultToSentTx({ txParams, result, type: 'SWEEP' })
    store.dispatch(transactionSent(sentTx))
  }

  return results
}

export const sendTransferTransaction = async (
  txParams: SignTransferTxParams,
  isLedger: boolean,
  ledgerTxParams: Omit<LedgerTxParams, 'signerKeyType'>
) => {
  let result: SignTransferTxResult

  if (isLedger) {
    if (isGrouplessKeyType(txParams.signerKeyType)) throw Error('Groupless address not supported on Ledger')

    result = await signer.signAndSubmitTransferTxLedger(txParams, {
      ...ledgerTxParams,
      signerKeyType: txParams.signerKeyType ?? 'default'
    })
  } else {
    result = await signer.signAndSubmitTransferTx(txParams)
  }

  const sentTx = signAndSubmitTxResultToSentTx({ type: 'TRANSFER', txParams, result })
  store.dispatch(transactionSent(sentTx))

  return result
}
