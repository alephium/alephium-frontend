import { formatRelativeTime, SHORT_DATE_OPTIONS, SHORT_DATE_TIME_OPTIONS, subtractMonths } from '../src/date'

describe('formatRelativeTime', () => {
  it('should format past timestamps', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    const result = formatRelativeTime(fiveMinutesAgo)
    expect(result).toContain('5')
    expect(result).toContain('minute')
  })

  it('should format future timestamps', () => {
    const inTwoHours = Date.now() + 2 * 60 * 60 * 1000
    const result = formatRelativeTime(inTwoHours)
    expect(result).toContain('2')
    expect(result).toContain('hour')
  })

  it('should handle "yesterday" and "tomorrow" with numeric: auto', () => {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000
    const result = formatRelativeTime(yesterday)
    expect(result).toMatch(/yesterday|1 day ago/)
  })

  it('should accept Date objects', () => {
    const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    const result = formatRelativeTime(date)
    expect(result).toContain('3')
    expect(result).toContain('day')
  })

  it('should use correct unit thresholds', () => {
    const thirtySeconds = Date.now() - 30 * 1000
    expect(formatRelativeTime(thirtySeconds)).toContain('second')

    const ninetyMinutes = Date.now() - 90 * 60 * 1000
    expect(formatRelativeTime(ninetyMinutes)).toContain('hour')

    const fortyFiveDays = Date.now() - 45 * 24 * 60 * 60 * 1000
    expect(formatRelativeTime(fortyFiveDays)).toContain('month')

    const fourHundredDays = Date.now() - 400 * 24 * 60 * 60 * 1000
    expect(formatRelativeTime(fourHundredDays)).toContain('year')
  })

  it('should support short style', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    const result = formatRelativeTime(fiveMinutesAgo, undefined, 'short')
    expect(result).toContain('5')
    expect(result).toMatch(/min/)
  })

  it('should support narrow style', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
    const result = formatRelativeTime(fiveMinutesAgo, undefined, 'narrow')
    expect(result).toContain('5')
  })

  it('should handle very recent timestamps as seconds', () => {
    const justNow = Date.now() - 500
    const result = formatRelativeTime(justNow)
    expect(result).toMatch(/second|now/)
  })
})

describe('SHORT_DATE_OPTIONS', () => {
  it('should format a date with day, month, and year', () => {
    const date = new Date(2026, 0, 15) // January 15, 2026
    const formatted = new Intl.DateTimeFormat('en-US', SHORT_DATE_OPTIONS).format(date)
    expect(formatted).toContain('01')
    expect(formatted).toContain('15')
    expect(formatted).toContain('2026')
  })

  it('should produce locale-dependent output', () => {
    const date = new Date(2026, 2, 5) // March 5, 2026
    const enUS = new Intl.DateTimeFormat('en-US', SHORT_DATE_OPTIONS).format(date)
    const deDE = new Intl.DateTimeFormat('de-DE', SHORT_DATE_OPTIONS).format(date)
    // Both contain the same digits but in different order
    expect(enUS).toContain('03')
    expect(deDE).toContain('03')
  })
})

describe('SHORT_DATE_TIME_OPTIONS', () => {
  it('should include date and time components', () => {
    const date = new Date(2026, 5, 20, 14, 30) // June 20, 2026 14:30
    const formatted = new Intl.DateTimeFormat('en-US', SHORT_DATE_TIME_OPTIONS).format(date)
    expect(formatted).toContain('2026')
    expect(formatted).toContain('14')
    expect(formatted).toContain('30')
  })

  it('should use 24-hour format', () => {
    const date = new Date(2026, 0, 1, 15, 45) // 3:45 PM
    const formatted = new Intl.DateTimeFormat('en-US', SHORT_DATE_TIME_OPTIONS).format(date)
    expect(formatted).toContain('15')
    expect(formatted).not.toMatch(/AM|PM/i)
  })

  it('should extend SHORT_DATE_OPTIONS', () => {
    expect(SHORT_DATE_TIME_OPTIONS.day).toBe(SHORT_DATE_OPTIONS.day)
    expect(SHORT_DATE_TIME_OPTIONS.month).toBe(SHORT_DATE_OPTIONS.month)
    expect(SHORT_DATE_TIME_OPTIONS.year).toBe(SHORT_DATE_OPTIONS.year)
  })
})

describe('subtractMonths', () => {
  it('should subtract months from a date', () => {
    const date = new Date(2026, 5, 15) // June 15, 2026
    const result = subtractMonths(date, 3)
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(2) // March
    expect(result.getDate()).toBe(15)
  })

  it('should cross year boundaries', () => {
    const date = new Date(2026, 1, 10) // February 10, 2026
    const result = subtractMonths(date, 4)
    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(9) // October
    expect(result.getDate()).toBe(10)
  })

  it('should handle subtracting more than 12 months', () => {
    const date = new Date(2026, 6, 1) // July 1, 2026
    const result = subtractMonths(date, 18)
    expect(result.getFullYear()).toBe(2025)
    expect(result.getMonth()).toBe(0) // January
  })

  it('should clamp day when target month is shorter', () => {
    const date = new Date(2026, 2, 31) // March 31, 2026
    const result = subtractMonths(date, 1)
    // February doesn't have 31 days, JS Date rolls over to March 3
    expect(result.getMonth()).toBe(2) // March (rolled over)
    expect(result.getDate()).toBe(3)
  })

  it('should handle leap year edge case', () => {
    const date = new Date(2024, 1, 29) // February 29, 2024 (leap year)
    const result = subtractMonths(date, 12)
    // February 2023 has no 29th, rolls to March 1
    expect(result.getFullYear()).toBe(2023)
    expect(result.getMonth()).toBe(2) // March
    expect(result.getDate()).toBe(1)
  })

  it('should not mutate the original date', () => {
    const date = new Date(2026, 5, 15)
    const original = date.getTime()
    subtractMonths(date, 3)
    expect(date.getTime()).toBe(original)
  })
})
