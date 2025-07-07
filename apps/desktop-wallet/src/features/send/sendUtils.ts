import { fromHumanReadableAmount, getTransactionAssetAmounts, SweepTxParams } from '@alephium/shared'
import { MIN_UTXO_SET_AMOUNT, SignTransferTxParams } from '@alephium/web3'

import { TransferTxData } from '@/features/send/sendTypes'

export const isAmountWithinRange = (amount: bigint, maxAmount: bigint): boolean =>
  amount >= MIN_UTXO_SET_AMOUNT && amount <= maxAmount

export const getTransferTxParams = (data: TransferTxData): SignTransferTxParams => {
  const { fromAddress, toAddress, assetAmounts, gasAmount, gasPrice, lockTime } = data
  const { attoAlphAmount, tokens } = getTransactionAssetAmounts(assetAmounts)

  return {
    signerAddress: fromAddress.hash,
    signerKeyType: fromAddress.keyType,
    destinations: [{ address: toAddress, attoAlphAmount, tokens, lockTime: lockTime ? lockTime.getTime() : undefined }],
    gasAmount: gasAmount ? gasAmount : undefined,
    gasPrice: gasPrice ? fromHumanReadableAmount(gasPrice).toString() : undefined
  }
}

export const getSweepTxParams = (data: TransferTxData, { toAddress }: { toAddress: string }): SweepTxParams => ({
  signerAddress: data.fromAddress.hash,
  signerKeyType: data.fromAddress.keyType,
  toAddress,
  lockTime: data.lockTime?.getTime()
})
