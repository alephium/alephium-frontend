import { explorer } from '@alephium/web3'

import { formatNumberForDisplay } from './strings'

export type YAxisType = 'plain' | 'formatted'
export type XAxisType = ApexXAxis['type']

export const formatYAxis =
  (type: YAxisType, unit: string) =>
  (value: number): string => {
    if (type === 'formatted') {
      const formattedParts = formatNumberForDisplay(value, unit, 'hash', 1)
      return formattedParts.join('') || ''
    }
    return value.toString()
  }

export const formatXAxis =
  (type: XAxisType, timeInterval: explorer.IntervalType) =>
  (value: string | string[]): string => {
    const _value = Array.isArray(value) ? (value.length > 0 ? value[0] : '') : value
    if (type === 'datetime') {
      if (typeof _value == 'string' || typeof _value == 'number') {
        const date = new Date(Number(_value))
        return timeInterval === explorer.IntervalType.Daily
          ? date.getDate().toString()
          : date.getHours().toString().padStart(2, '0')
      }
    }
    return _value
  }

export const formatSeriesNumber = (type: YAxisType, value: number): string => {
  if (type === 'formatted') {
    return value.toString()
  }
  return value.toString()
}
