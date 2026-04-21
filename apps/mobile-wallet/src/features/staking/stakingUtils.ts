import { ALPH } from '@alephium/token-list'
import Decimal from 'decimal.js'

/** 0.001 ALPH in base units (ALPH uses 18 decimals). */
const MIN_CLAIMABLE_ATTO_ALPH = 10n ** BigInt(ALPH.decimals - 3)

export const isClaimable = (amount: bigint): boolean => amount > MIN_CLAIMABLE_ATTO_ALPH

const pow10AlphDecimals = new Decimal(10).pow(ALPH.decimals)

/** xALPH to receive when staking `amountAttoAlph`, given deposited ALPH per 1 xALPH (from token state). */
export const previewXAlphForStake = (amountAttoAlph: bigint, alphPerXAlph: Decimal): string => {
  if (alphPerXAlph.lte(0)) return ''

  return new Decimal(amountAttoAlph.toString())
    .div(alphPerXAlph)
    .div(pow10AlphDecimals)
    .toDecimalPlaces(4, Decimal.ROUND_DOWN)
    .toString()
}

/** ALPH unlocked over time when unstaking `xAlphAmountAtto`, same rate as stake preview. */
export const previewAlphForUnstake = (xAlphAmountAtto: bigint, alphPerXAlph: Decimal): string => {
  if (alphPerXAlph.lte(0)) return ''

  return new Decimal(xAlphAmountAtto.toString())
    .mul(alphPerXAlph)
    .div(pow10AlphDecimals)
    .toDecimalPlaces(4, Decimal.ROUND_DOWN)
    .toString()
}
