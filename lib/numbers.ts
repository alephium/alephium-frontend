/*
Copyright 2018 - 2022 The Alephium Authors
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

import { NUM_OF_ZEROS_IN_QUINTILLION } from './constants'

export const MAGNITUDE_SYMBOL = ['', 'K', 'M', 'B', 'T']

export const produceZeros = (numberOfZeros: number): string => (numberOfZeros > 0 ? '0'.repeat(numberOfZeros) : '')

const getNumberOfTrailingZeros = (numString: string) => {
  let numberOfZeros = 0

  for (let i = numString.length - 1; i >= 0; i--) {
    if (numString[i] === '0') {
      numberOfZeros++
    } else {
      break
    }
  }

  return numberOfZeros
}

const removeTrailingZeros = (numString: string, minNumberOfDecimals?: number) => {
  const numberOfZeros = getNumberOfTrailingZeros(numString)
  const numStringWithoutTrailingZeros = numString.substring(0, numString.length - numberOfZeros)

  if (!minNumberOfDecimals)
    return numStringWithoutTrailingZeros.endsWith('.')
      ? numStringWithoutTrailingZeros.slice(0, -1)
      : numStringWithoutTrailingZeros

  if (minNumberOfDecimals < 0) throw 'minNumberOfDecimals should be positive'

  const indexOfPoint = numStringWithoutTrailingZeros.indexOf('.')
  if (indexOfPoint === -1) throw 'numString should contain decimal point'

  const numberOfDecimals = numStringWithoutTrailingZeros.length - 1 - indexOfPoint

  return numberOfDecimals < minNumberOfDecimals
    ? numStringWithoutTrailingZeros.concat(produceZeros(minNumberOfDecimals - numberOfDecimals))
    : numStringWithoutTrailingZeros
}

const appendMagnitudeSymbol = (tier: number, amount: number, numberOfDecimalsToDisplay = 2): string => {
  const reachedEndOfMagnitudeSymbols = tier >= MAGNITUDE_SYMBOL.length
  const adjustedTier = reachedEndOfMagnitudeSymbols ? tier - 1 : tier
  const suffix = MAGNITUDE_SYMBOL[adjustedTier]
  const scale = Math.pow(10, adjustedTier * 3)
  const scaled = amount / scale
  const scaledRoundedUp = scaled.toFixed(numberOfDecimalsToDisplay)

  return reachedEndOfMagnitudeSymbols
    ? addApostrophes(scaledRoundedUp) + suffix
    : parseFloat(scaledRoundedUp) < 1000
    ? scaledRoundedUp + suffix
    : appendMagnitudeSymbol(tier + 1, amount, numberOfDecimalsToDisplay)
}

interface FormatAmountForDisplayProps {
  amount: bigint
  amountDecimals?: number
  displayDecimals?: number
  truncate?: boolean
  fullPrecision?: boolean
}

export const formatAmountForDisplay = ({
  amount,
  amountDecimals = NUM_OF_ZEROS_IN_QUINTILLION,
  displayDecimals,
  truncate,
  fullPrecision = false
}: FormatAmountForDisplayProps): string => {
  if (amount < BigInt(0)) return '???'

  // For abbreviation, we don't need full precision and can work with number
  const alphString = toHumanReadableAmount(amount, amountDecimals)
  const alphNum = Number(alphString)
  const minNumberOfDecimals = alphNum >= 0.000005 && alphNum < 0.01 ? 3 : 2
  const numberOfDecimalsToDisplay = displayDecimals ?? minNumberOfDecimals

  if (aboveExpLimit(alphString)) {
    return toExponential(alphString, numberOfDecimalsToDisplay, truncate)
  }

  if (fullPrecision) {
    const baseNumString = amount.toString()
    const numNonDecimals = baseNumString.length - amountDecimals
    const alphNumString =
      numNonDecimals > 0
        ? baseNumString.substring(0, numNonDecimals).concat('.', baseNumString.substring(numNonDecimals))
        : '0.'.concat(produceZeros(-numNonDecimals), baseNumString)

    return removeTrailingZeros(alphNumString, numberOfDecimalsToDisplay)
  }

  if (alphNum < 0.001) {
    const tinyAmountsMaxNumberDecimals = 5

    return removeTrailingZeros(alphNum.toFixed(tinyAmountsMaxNumberDecimals), minNumberOfDecimals)
  } else if (alphNum < 1000000 && parseFloat(alphNum.toFixed(numberOfDecimalsToDisplay)) < 1000000) {
    const amountWithRemovedTrailingZeros = removeTrailingZeros(
      alphNum.toFixed(numberOfDecimalsToDisplay),
      minNumberOfDecimals
    )

    return alphNum >= 1000 ? addApostrophes(amountWithRemovedTrailingZeros) : amountWithRemovedTrailingZeros
  }

  const tier = alphNum < 1000000000 ? 2 : alphNum < 1000000000000 ? 3 : 4

  return appendMagnitudeSymbol(tier, alphNum, numberOfDecimalsToDisplay)
}

export const formatFiatAmountForDisplay = (amount: number): string => {
  if (amount < 0) throw `Invalid fiat amount: ${amount}. Fiat amount cannot be negative.`

  if (amount < 1000000) {
    const roundedUp = amount.toFixed(2)
    if (parseFloat(roundedUp) < 1000000) return addApostrophes(roundedUp)
  }

  const tier = amount < 1000000000 ? 2 : amount < 1000000000000 ? 3 : amount < 1000000000000000 ? 4 : 5

  if (tier === 5) {
    return amount.toExponential()
  }

  return appendMagnitudeSymbol(tier, amount)
}

export const fromHumanReadableAmount = (amount: string, decimals = NUM_OF_ZEROS_IN_QUINTILLION): bigint => {
  if (!isNumber(amount) || Number(amount) < 0) throw 'Invalid displayed amount'
  if (!isPositiveInt(decimals)) throw 'Invalid decimals number'
  if (amount === '0') return BigInt(0)

  const amountToProcess = isExponentialNotation(amount) ? exponentialToLiteral(amount) : amount

  const numberOfDecimals = getNumberOfDecimals(amountToProcess)
  if (numberOfDecimals > decimals) throw 'Cannot convert human readable amount because it has too many decimal points'

  const numberOfZerosToAdd = decimals - numberOfDecimals

  const cleanedAmount = amountToProcess.replace('.', '') + produceZeros(numberOfZerosToAdd)

  return BigInt(cleanedAmount)
}

export const addApostrophes = (numString: string): string => {
  if (!isNumber(numString)) {
    throw new Error('Invalid number')
  }

  if (isExponentialNotation(numString)) {
    return numString
  }

  const parts = numString.split('.')
  const wholePart = parts[0]
  const fractionalPart = parts.length > 1 ? parts[1] : ''
  const wholePartWithApostrophes = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, "'")

  return `${wholePartWithApostrophes}${fractionalPart ? `.${fractionalPart}` : ''}`
}

export const toHumanReadableAmount = (amount: bigint, decimals = NUM_OF_ZEROS_IN_QUINTILLION): string => {
  if (!isPositiveInt(decimals)) throw 'Invalid decimals number'

  const amountStr = amount.toString()

  if (decimals === 0 || amountStr === '0') return amountStr

  const positionForDot = amountStr.length - decimals
  const withDotAdded =
    positionForDot > 0
      ? amountStr.substring(0, positionForDot) + '.' + amountStr.substring(positionForDot)
      : '0.' + produceZeros(decimals - amountStr.length) + amountStr

  return removeTrailingZeros(withDotAdded)
}

export const exponentialToLiteral = (str: string): string => {
  const [base, exponent] = str.split('e')
  let response = ''

  if (!base || !exponent) {
    return str
  }

  if (exponent.includes('-')) {
    const e = Number(exponent.slice(1))

    response = base.split('.')[0] + (base.split('.')[1] || '').substring(0, e)
    response = '0.' + '0'.repeat(e - 1) + response.replace('.', '')
  } else {
    const e = Number(exponent)
    const decimal = base.split('.')[1] || ''

    response = base.split('.')[0] + decimal.substring(0, e)
    if (decimal.length > e) {
      response += '.' + decimal.substring(e)
    } else if (e > decimal.length) {
      response += '0'.repeat(e - decimal.length)
    }
  }

  return response
}

export const toExponential = (num: number | string, fractionDigits = 0, truncate?: boolean): string => {
  const numValue = typeof num === 'string' ? Number(num) : num

  if (isNaN(numValue)) {
    throw new Error('Invalid input: input cannot be converted to a number.')
  }

  if (!truncate) {
    return numValue.toExponential(fractionDigits)
  }

  const expStr = numValue.toExponential()
  const [base, exponent] = expStr.split('e')
  const decimalIndex = base.indexOf('.')

  let returnedBase = base

  if (decimalIndex !== -1) {
    returnedBase = base.slice(0, decimalIndex + fractionDigits + 1)
  }

  return returnedBase + 'e' + exponent
}

export const aboveExpLimit = (num: number | string): boolean => {
  const baseStr = '1000000000000000000' // 1'000'000 trillions
  const str = num.toString()
  const [base, exponent] = str.toLowerCase().split('e')

  if (!exponent) {
    const numStr = str.split('.')[0]
    if (numStr.length > baseStr.length) {
      return true
    } else if (numStr.length === baseStr.length) {
      return numStr >= baseStr
    } else {
      return false
    }
  }

  const isNegativeExponent = exponent.startsWith('-')
  const exponentValue = Number(exponent.replace('-', ''))

  if (isNegativeExponent) {
    return false
  } else {
    const baseWithoutDecimal = base.split('.')[0]
    const comparisonLength = baseWithoutDecimal.length + exponentValue

    if (comparisonLength > baseStr.length) {
      return true
    } else if (comparisonLength === baseStr.length) {
      return baseWithoutDecimal >= baseStr.slice(0, baseWithoutDecimal.length)
    } else {
      return false
    }
  }
}

export const isExponentialNotation = (numString: string) => numString.includes('e')

export const isNumber = (numString: string): boolean => !Number.isNaN(Number(numString)) && numString.length > 0

export const calculateAmountWorth = (
  amount: bigint,
  fiatPrice: number,
  decimals = NUM_OF_ZEROS_IN_QUINTILLION
): number => {
  if (fiatPrice < 0) throw `Invalid fiat price: ${fiatPrice}. Fiat price cannot be negative.`

  return fiatPrice * parseFloat(toHumanReadableAmount(amount, decimals))
}

const isPositiveInt = (number: number) => Number.isInteger(number) && number >= 0

export const getNumberOfDecimals = (amount: string): number =>
  amount.includes('.') ? amount.length - 1 - amount.indexOf('.') : 0

export const convertToPositive = (num: bigint): bigint => (num < 0 ? num * BigInt(-1) : num)

export const convertToNegative = (num: bigint): bigint => (num > 0 ? num * BigInt(-1) : num)
