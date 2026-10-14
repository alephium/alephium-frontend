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

/** xALPH returned when cancelling an unstake, computed like `XAlphToken.cancelUnstake`: the ALPH that has not unlocked yet is restaked at the current rate. */
export const getCancelUnstakeXAlphOut = (
  notYetClaimableAlph: bigint,
  totalXAlphSupply: bigint,
  totalDepositedAlph: bigint
): bigint => {
  if (notYetClaimableAlph <= 0n) return 0n
  if (totalXAlphSupply === 0n || totalDepositedAlph === 0n) return notYetClaimableAlph

  return (notYetClaimableAlph * totalXAlphSupply) / totalDepositedAlph
}

/** Compact time left until an unstake fully unlocks, e.g. "12d 23h" or "4h 59m". Returns '' once unlocked. */
export const formatUnstakeTimeLeft = (timeLeftMs: number): string => {
  if (timeLeftMs <= 0) return ''

  const totalMinutes = Math.ceil(timeLeftMs / 60_000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60

  if (days > 0) return hours > 0 ? `${days}d ${hours}h` : `${days}d`
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`

  return `${minutes}m`
}
