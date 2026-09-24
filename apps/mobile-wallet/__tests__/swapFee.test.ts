import { ALPH } from '@alephium/token-list'
import { DUST_AMOUNT, ONE_ALPH } from '@alephium/web3'

import { calculateSwapFee } from '~/features/swap/swapFee'

const USDT = 'usdt-token-id'

describe('calculateSwapFee', () => {
  it('subtracts the configured basis points from the gross amount', () => {
    expect(calculateSwapFee({ grossAmount: ONE_ALPH, inputTokenId: ALPH.id, bps: 50 })).toBe(ONE_ALPH / 200n)
    expect(calculateSwapFee({ grossAmount: 1000n, inputTokenId: USDT, bps: 250 })).toBe(25n)
  })

  it('returns zero when no fee is configured', () => {
    expect(calculateSwapFee({ grossAmount: ONE_ALPH, inputTokenId: ALPH.id, bps: 0 })).toBe(0n)
    expect(calculateSwapFee({ grossAmount: ONE_ALPH, inputTokenId: ALPH.id, bps: -1 })).toBe(0n)
  })

  it('return zero when input amount is zero', () => {
    expect(calculateSwapFee({ grossAmount: 0n, inputTokenId: ALPH.id, bps: 50 })).toBe(0n)
  })

  it('returns zero when the fee truncates to zero', () => {
    // 199 * 50 / 10000 floors to 0
    expect(calculateSwapFee({ grossAmount: 199n, inputTokenId: USDT, bps: 50 })).toBe(0n)
  })

  it('returns zero when token is ALPH and the fee is below the dust limit', () => {
    const justUnderDust = (DUST_AMOUNT - 1n) * 200n // at 50 bps this yields DUST_AMOUNT - 1
    const atDust = DUST_AMOUNT * 200n

    expect(calculateSwapFee({ grossAmount: justUnderDust, inputTokenId: ALPH.id, bps: 50 })).toBe(0n)
    expect(calculateSwapFee({ grossAmount: atDust, inputTokenId: ALPH.id, bps: 50 })).toBe(DUST_AMOUNT)
  })

  it('does not apply the ALPH dust limit to other tokens', () => {
    const fee = calculateSwapFee({ grossAmount: 20000n, inputTokenId: USDT, bps: 50 })

    expect(fee).toBe(100n)
    expect(fee).toBeLessThan(DUST_AMOUNT)
  })
})
