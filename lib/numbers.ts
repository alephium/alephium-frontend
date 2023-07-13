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

const MAGNITUDE_SYMBOL = ['', 'K', 'M', 'B', 'T', 'P', 'E', 'Z', 'Y', 'R', 'Q']

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
  fullPrecision?: boolean
}

export const formatAmountForDisplay = ({
  amount,
  amountDecimals = NUM_OF_ZEROS_IN_QUINTILLION,
  displayDecimals,
  fullPrecision = false
}: FormatAmountForDisplayProps): string => {
  if (amount < BigInt(0)) return '???'

  // For abbreviation, we don't need full precision and can work with number
  const alphNum = Number(toHumanReadableAmount(amount, amountDecimals))
  const minNumberOfDecimals = alphNum >= 0.000005 && alphNum < 0.01 ? 3 : 2
  const numberOfDecimalsToDisplay = displayDecimals || minNumberOfDecimals

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

  const tier = amount < 1000000000 ? 2 : amount < 1000000000000 ? 3 : 4

  return appendMagnitudeSymbol(tier, amount)
}

export const fromHumanReadableAmount = (amount: string, decimals = NUM_OF_ZEROS_IN_QUINTILLION): bigint => {
  if (!isNumber(amount) || Number(amount) < 0) throw 'Invalid displayed amount'
  if (!isPositiveInt(decimals)) throw 'Invalid decimals number'
  if (amount === '0') return BigInt(0)

  const numberOfDecimals = getNumberOfDecimals(amount)
  if (numberOfDecimals > decimals) throw 'Cannot convert human readable amount because it has too many decimal points'

  const numberOfZerosToAdd = decimals - numberOfDecimals
  const cleanedAmount = amount.replace('.', '') + produceZeros(numberOfZerosToAdd)

  return BigInt(cleanedAmount)
}

export const addApostrophes = (numString: string): string => {
  if (!isNumber(numString)) {
    console.error('Invalid number', numString)

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

export const isNumber = (numString: string): boolean =>
  !Number.isNaN(Number(numString)) && numString.length > 0 && !numString.includes('e')

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
