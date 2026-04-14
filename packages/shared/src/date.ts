export const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
}

export const SHORT_DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  ...SHORT_DATE_OPTIONS,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}

import { ONE_DAY_MS, ONE_HOUR_MS, ONE_MINUTE_MS, ONE_WEEK_MS } from './constants'

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * ONE_DAY_MS],
  ['month', 30 * ONE_DAY_MS],
  ['week', ONE_WEEK_MS],
  ['day', ONE_DAY_MS],
  ['hour', ONE_HOUR_MS],
  ['minute', ONE_MINUTE_MS],
  ['second', 1000]
]

export const formatRelativeTime = (
  timestamp: number | Date,
  locale?: string,
  style: 'long' | 'short' | 'narrow' = 'long'
): string => {
  const ms = typeof timestamp === 'number' ? timestamp : timestamp.getTime()
  const diffMs = ms - Date.now()
  const absDiffMs = Math.abs(diffMs)

  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style })

  for (const [unit, unitMs] of UNITS) {
    if (absDiffMs >= unitMs || unit === 'second') {
      const value = Math.round(diffMs / unitMs)
      return formatter.format(value, unit)
    }
  }

  return formatter.format(0, 'second')
}

export const subtractMonths = (date: Date, months: number): Date => {
  const d = new Date(date)
  d.setMonth(d.getMonth() - months)
  return d
}
