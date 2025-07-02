import { Address, AddressHash, throttledClient } from '@alephium/shared'

import { signer } from '@/signer'
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
