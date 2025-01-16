import { keyring } from '@alephium/keyring'
import { AddressHash, throttledClient } from '@alephium/shared'

import { LedgerAlephium } from '@/features/ledger/utils'
import { Address } from '@/types/addresses'
import { CsvExportQueryParams } from '@/types/transactions'

export const buildSweepTransactions = async (fromAddress: Address, toAddressHash: AddressHash) => {
  const { unsignedTxs } = await throttledClient.node.transactions.postTransactionsSweepAddressBuild({
    fromPublicKey: fromAddress.publicKey,
    toAddress: toAddressHash
  })

  return {
    unsignedTxs,
    fees: unsignedTxs.reduce((acc, tx) => acc + BigInt(tx.gasPrice) * BigInt(tx.gasAmount), BigInt(0))
  }
}

export const signAndSendTransaction = async (
  fromAddress: Address,
  txId: string,
  unsignedTx: string,
  isLedger: boolean,
  onLedgerError: (error: Error) => void
) => {
  const signature = isLedger
    ? await LedgerAlephium.create()
        .catch(onLedgerError)
        .then((app) => (app ? app.signUnsignedTx(fromAddress.index, unsignedTx) : null))
    : keyring.signTransaction(txId, fromAddress.hash)

  if (!signature) {
    throw new Error()
  }

  const data = await throttledClient.node.transactions.postTransactionsSubmit({ unsignedTx, signature })

  return { ...data, signature }
}

export const fetchCsv = async ({ addressHash, ...timeRangeQueryParams }: CsvExportQueryParams) =>
  await throttledClient.explorer.addresses.getAddressesAddressExportTransactionsCsv(addressHash, timeRangeQueryParams, {
    format: 'text'
  })
