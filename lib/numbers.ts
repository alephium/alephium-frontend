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

import { NUM_OF_ZEROS_IN_QUINTILLION, QUINTILLION } from './constants'

const MAGNITUDE_SYMBOL = ['', 'K', 'M', 'B', 'T']

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
  const reacthedEndOfMagnitudeSymbols = tier >= MAGNITUDE_SYMBOL.length
  const adjustedTier = reacthedEndOfMagnitudeSymbols ? tier - 1 : tier
  const suffix = MAGNITUDE_SYMBOL[adjustedTier]
  const scale = Math.pow(10, adjustedTier * 3)
  const scaled = amount / scale
  const scaledRoundedUp = scaled.toFixed(numberOfDecimalsToDisplay)

  return reacthedEndOfMagnitudeSymbols
    ? addApostrophes(scaledRoundedUp) + suffix
    : parseFloat(scaledRoundedUp) < 1000
    ? scaledRoundedUp + suffix
    : appendMagnitudeSymbol(tier + 1, amount, numberOfDecimalsToDisplay)
}

export const formatAmountForDisplay = (
  baseNum: bigint,
  showFullPrecision = false,
  nbOfDecimalsToShow?: number
): string => {
  if (baseNum < BigInt(0)) return '???'

  // For abbreviation, we don't need full precision and can work with number
  const alphNum = Number(baseNum) / QUINTILLION
  const minNumberOfDecimals = alphNum >= 0.000005 && alphNum < 0.01 ? 3 : 2
  const numberOfDecimalsToDisplay = nbOfDecimalsToShow || minNumberOfDecimals

  if (showFullPrecision) {
    const baseNumString = baseNum.toString()
    const numNonDecimals = baseNumString.length - NUM_OF_ZEROS_IN_QUINTILLION
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

export const convertAlphToSet = (amount: string): bigint => {
  if (!isNumber(amount) || Number(amount) < 0) throw 'Invalid Alph amount'
  if (amount === '0') return BigInt(0)

  const numberOfDecimals = amount.includes('.') ? amount.length - 1 - amount.indexOf('.') : 0
  const numberOfZerosToAdd = NUM_OF_ZEROS_IN_QUINTILLION - numberOfDecimals
  const cleanedAmount = amount.replace('.', '') + produceZeros(numberOfZerosToAdd)

  return BigInt(cleanedAmount)
}

export const addApostrophes = (numString: string): string => {
  if (!isNumber(numString)) throw 'Invalid number'

  return numString.replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}

export const convertSetToAlph = (amountInSet: bigint): string => {
  const amountInSetStr = amountInSet.toString()

  if (amountInSetStr === '0') return amountInSetStr

  const positionForDot = amountInSetStr.length - NUM_OF_ZEROS_IN_QUINTILLION
  const withDotAdded =
    positionForDot > 0
      ? amountInSetStr.substring(0, positionForDot) + '.' + amountInSetStr.substring(positionForDot)
      : '0.' + produceZeros(NUM_OF_ZEROS_IN_QUINTILLION - amountInSetStr.length) + amountInSetStr

  return removeTrailingZeros(withDotAdded)
}

export const isNumber = (numString: string): boolean =>
  !Number.isNaN(Number(numString)) && numString.length > 0 && !numString.includes('e')

export const convertSetToFiat = (amountInSet: bigint, fiatAlphValue: number): number => {
  if (fiatAlphValue < 0) throw `Invalid fiat value: ${fiatAlphValue}. Fiat value cannot be negative.`

  return fiatAlphValue * (parseFloat(amountInSet.toString()) / QUINTILLION)
}
