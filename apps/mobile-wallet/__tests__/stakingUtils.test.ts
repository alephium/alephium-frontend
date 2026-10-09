import { formatUnstakeTimeLeft, getCancelUnstakeXAlphOut } from '~/features/staking/stakingUtils'

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

describe('formatUnstakeTimeLeft', () => {
  const MINUTE = 60_000
  const HOUR = 60 * MINUTE
  const DAY = 24 * HOUR

  it('shows days and hours', () => {
    expect(formatUnstakeTimeLeft(12 * DAY + 23 * HOUR)).toBe('12d 23h')
    expect(formatUnstakeTimeLeft(3 * DAY)).toBe('3d')
  })

  it('shows hours and minutes under a day', () => {
    expect(formatUnstakeTimeLeft(4 * HOUR + 59 * MINUTE)).toBe('4h 59m')
    expect(formatUnstakeTimeLeft(2 * HOUR)).toBe('2h')
  })

  it('rounds seconds up to the next minute', () => {
    expect(formatUnstakeTimeLeft(30_000)).toBe('1m')
  })

  it('returns an empty string once unlocked', () => {
    expect(formatUnstakeTimeLeft(0)).toBe('')
    expect(formatUnstakeTimeLeft(-DAY)).toBe('')
  })
})
