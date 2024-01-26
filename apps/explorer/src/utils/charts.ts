/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { explorer } from '@alephium/web3'
import dayjs from 'dayjs'

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
        return timeInterval === explorer.IntervalType.Daily ? dayjs(_value).format('D') : dayjs(_value).format('hh')
      }
    }
    return _value
  }

export const formatSeriesNumber = (type: YAxisType, value: number): string => {
  // TODO: Special formatting (TX/s, etc)
  if (type === 'formatted') {
    return value.toString()
  }
  return value.toString()
}
