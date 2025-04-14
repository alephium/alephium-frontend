import { AssetAmount } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { DUST_AMOUNT, MIN_UTXO_SET_AMOUNT } from '@alephium/web3'

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
