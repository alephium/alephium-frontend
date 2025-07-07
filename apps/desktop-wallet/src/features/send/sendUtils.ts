import { fromHumanReadableAmount, getTransactionAssetAmounts, MAXIMAL_GAS_FEE, SweepTxParams } from '@alephium/shared'
import { MIN_UTXO_SET_AMOUNT, SignChainedTxParams, SignTransferTxParams } from '@alephium/web3'

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

export const getChainedTxParams = (
  groupedAddressWithEnoughAlphForGas: string,
  data: TransferTxData
): Array<SignChainedTxParams> => [
  {
    type: 'Transfer',
    signerAddress: groupedAddressWithEnoughAlphForGas,
    signerKeyType: 'default',
    destinations: [{ address: data.fromAddress.hash, attoAlphAmount: MAXIMAL_GAS_FEE }]
  },
  {
    type: 'Transfer',
    ...getTransferTxParams(data)
  }
]
