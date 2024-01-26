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

export const smartHash = (hash: string) => {
  if (hash.length <= 16) return hash
  else return hash.substring(0, 8) + '...' + hash.substring(hash.length - 8)
}

export const checkHexStringValidity = (stringToTest: string) => /^[a-fA-F0-9]+$/.test(stringToTest)

export const formatNumberForDisplay = (
  number: number,
  unit: string,
  numberType: 'quantity' | 'hash' = 'quantity',
  maxDecimals: 0 | 1 | 2 = 1
) => {
  const suffixes = {
    quantity: ['', 'K', 'M', 'B', 'T'],
    hash: ['', 'K', 'M', 'G', 'T', 'P']
  }[numberType]

  let formatedNumber = number
  let suffixIndex = 0
  while (formatedNumber >= 1000 && suffixIndex < suffixes.length - 1) {
    formatedNumber /= 1000
    suffixIndex++
  }

  const denominator = maxDecimals === 1 ? 10 : maxDecimals === 2 ? 100 : 1000
  const preciseNumber = (Math.round((formatedNumber + Number.EPSILON) * denominator) / denominator).toString()
  const numberParts = preciseNumber.split('.')
  const numberInteger = numberParts[0]
  const numberDecimal = maxDecimals !== 0 ? (numberParts.length > 1 && `.${numberParts[1]}`) || '.0' : undefined

  return [numberInteger, numberDecimal, suffixes[suffixIndex], unit]
}

export const SIMPLE_DATE_FORMAT = 'DD/MM/YYYY'
export const DATE_TIME_FORMAT = `${SIMPLE_DATE_FORMAT} HH:mm:ss [UTC]Z`
