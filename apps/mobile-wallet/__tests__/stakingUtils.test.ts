import { getCancelUnstakeXAlphOut } from '~/features/staking/stakingUtils'

const ALPH = 10n ** 18n

describe('getCancelUnstakeXAlphOut', () => {
  it('restakes the not yet unlocked ALPH at the current rate', () => {
    // 1 xALPH = 1.004 ALPH
    expect(getCancelUnstakeXAlphOut(700n * ALPH, 1000n * ALPH, 1004n * ALPH)).toBe(
      (700n * ALPH * 1000n * ALPH) / (1004n * ALPH)
    )
  })

  it('returns the ALPH amount 1:1 when there is no xALPH supply', () => {
    expect(getCancelUnstakeXAlphOut(700n * ALPH, 0n, 0n)).toBe(700n * ALPH)
  })

  it('returns 0 when everything has already unlocked', () => {
    expect(getCancelUnstakeXAlphOut(0n, 1000n * ALPH, 1004n * ALPH)).toBe(0n)
  })
})
