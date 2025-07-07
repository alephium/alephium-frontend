import { AssetAmount, fromHumanReadableAmount, SweepTxParams } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { DUST_AMOUNT, MIN_UTXO_SET_AMOUNT, SignTransferTxParams } from '@alephium/web3'

import { TransferTxData } from '@/features/send/sendTypes'

export const getTransactionAssetAmounts = (assetAmounts: AssetAmount[]) => {
  const alphAmount = assetAmounts.find((asset) => asset.id === ALPH.id)?.amount ?? BigInt(0)
  const tokens = assetAmounts
    .filter((asset): asset is Required<AssetAmount> => asset.id !== ALPH.id && asset.amount !== undefined)
    .map((asset) => ({ id: asset.id, amount: asset.amount.toString() }))

  const minAlphAmountRequirement = DUST_AMOUNT * BigInt(tokens.length)

  return {
    attoAlphAmount: (alphAmount + minAlphAmountRequirement).toString(),
    extraAlphForDust: minAlphAmountRequirement,
    tokens
  }
}

export const getOptionalTransactionAssetAmounts = (assetAmounts?: AssetAmount[]) =>
  assetAmounts ? getTransactionAssetAmounts(assetAmounts) : { attoAlphAmount: undefined, tokens: undefined }

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

export const getSweepTxParams = (data: TransferTxData, consolidationRequired: boolean): SweepTxParams => {
  const { fromAddress, toAddress, lockTime } = data

  return {
    signerAddress: fromAddress.hash,
    signerKeyType: fromAddress.keyType,
    toAddress: consolidationRequired ? fromAddress.hash : toAddress,
    lockTime: lockTime?.getTime()
  }
}
