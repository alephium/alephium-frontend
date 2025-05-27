import { AssetAmount } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { DUST_AMOUNT } from '@alephium/web3'

import { AddressPendingTransaction, AddressTransaction } from '~/types/transactions'

export const isPendingTx = (tx: AddressTransaction): tx is AddressPendingTransaction =>
  (tx as AddressPendingTransaction).status === 'pending'

// Same as in desktop wallet
export const getTransactionAssetAmounts = (assetAmounts: AssetAmount[]) => {
  const alphAmount = assetAmounts.find((asset) => asset.id === ALPH.id)?.amount ?? BigInt(0)
  const tokens = assetAmounts
    .filter((asset): asset is Required<AssetAmount> => asset.id !== ALPH.id && asset.amount !== undefined)
    .map((asset) => ({ id: asset.id, amount: asset.amount.toString() }))

  const minAlphAmountRequirement = DUST_AMOUNT * BigInt(tokens.length)
  const minDiff = minAlphAmountRequirement - alphAmount
  const totalAlphAmount = minDiff > 0 ? alphAmount + minDiff : alphAmount

  return {
    attoAlphAmount: totalAlphAmount.toString(),
    tokens
  }
}

// Same as in desktop wallet
export const getOptionalTransactionAssetAmounts = (assetAmounts?: AssetAmount[]) =>
  assetAmounts ? getTransactionAssetAmounts(assetAmounts) : { attoAlphAmount: undefined, tokens: undefined }
