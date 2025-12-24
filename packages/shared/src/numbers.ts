import { NUM_OF_ZEROS_IN_QUINTILLION } from '@/constants'

export const MAGNITUDE_SYMBOL = ['K', 'M', 'B', 'T']

const AMOUNT_SUFFIXES = ['', ...MAGNITUDE_SYMBOL]

// Subscript digit mapping for Unicode subscript characters
const SUBSCRIPT_DIGITS: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉'
}

/**
 * Converts a number to its subscript representation
 * @param num - The number to convert to subscript
 * @returns The subscript representation of the number
 */
const toSubscript = (num: number): string =>
  num
    .toString()
    .split('')
    .map((digit) => SUBSCRIPT_DIGITS[digit] || digit)
    .join('')

/**
 * Formats a number string with subscript notation for consecutive zeros after decimal point.
 * For example: "0.000001" becomes "0.0₅1" where ₅ indicates 5 zeros.
 * @param numString - The number string to format
 * @param minZerosForSubscript - Minimum consecutive zeros required to apply subscript (default: 4)
 * @returns The formatted string with subscript notation if applicable
 */
export const formatWithSubscript = (numString: string, minZerosForSubscript = 4): string => {
  // Only process if the string contains a decimal point
  if (!numString.includes('.')) return numString

  const [integerPart, decimalPart] = numString.split('.')

  // Match consecutive zeros at the start of the decimal part
  const zeroMatch = decimalPart.match(/^(0+)/)

  if (!zeroMatch) return numString

  const consecutiveZeros = zeroMatch[1].length

  // Only apply subscript if we have enough consecutive zeros
  if (consecutiveZeros < minZerosForSubscript) return numString

  // Get the remaining significant digits after the zeros
  const significantDigits = decimalPart.substring(consecutiveZeros)

  // If there are no significant digits, return the original
  if (!significantDigits) return numString

  // Format: "0.0" + subscript(count) + significant digits
  return `${integerPart}.0${toSubscript(consecutiveZeros)}${significantDigits}`
}

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

export const removeTrailingZeros = (numString: string, minNumberOfDecimals?: number) => {
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
  const reachedEndOfMagnitudeSymbols = tier >= AMOUNT_SUFFIXES.length
  const adjustedTier = reachedEndOfMagnitudeSymbols ? tier - 1 : tier
  const suffix = AMOUNT_SUFFIXES[adjustedTier]
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
  smartRounding?: boolean
  region?: string
  useSubscriptNotation?: boolean
}

export const formatAmountForDisplay = ({
  amount,
  amountDecimals = NUM_OF_ZEROS_IN_QUINTILLION,
  displayDecimals,
  truncate,
  smartRounding = true,
  fullPrecision = false,
  region = 'en-US',
  useSubscriptNotation = false
}: FormatAmountForDisplayProps): string => {
  if (amount < BigInt(0)) return '???'

  const amountString = toHumanReadableAmount(amount, amountDecimals)
  const amountNumber = Number(amountString)

  if (amountNumber < 0.0001) {
    if (smartRounding && !fullPrecision) {
      const rounded = smartRound(amountString, region)
      return useSubscriptNotation ? formatWithSubscript(rounded) : rounded
    } else {
      fullPrecision = true
    }
  }

  const minNumberOfDecimals = getMinNumberOfDecimals(amountNumber)
  const numberOfDecimalsToDisplay = displayDecimals ?? minNumberOfDecimals

  if (aboveExpLimit(amountString)) {
    return toExponential(amountString, region, numberOfDecimalsToDisplay, truncate)
  }

  if (fullPrecision) {
    const formatted = formatFullPrecision(amount, amountDecimals, numberOfDecimalsToDisplay, region)
    return useSubscriptNotation ? formatWithSubscript(formatted) : formatted
  }

  const formatted = formatRegularPrecision(amountNumber, numberOfDecimalsToDisplay, minNumberOfDecimals, region)
  return useSubscriptNotation ? formatWithSubscript(formatted) : formatted
}

const getMinNumberOfDecimals = (amountNumber: number): number =>
  amountNumber <= 0 ? 0 : amountNumber < 0.01 && amountNumber >= 0.001 ? 3 : amountNumber < 0.001 ? 4 : 2

const formatFullPrecision = (
  amount: bigint,
  amountDecimals: number,
  numberOfDecimalsToDisplay: number,
  region: string
): string => {
  const baseNumString = amount.toString()
  const numNonDecimals = baseNumString.length - amountDecimals
  const amountNumberString =
    numNonDecimals > 0
      ? baseNumString.substring(0, numNonDecimals) + '.' + baseNumString.substring(numNonDecimals)
      : '0.' + produceZeros(-numNonDecimals) + baseNumString

  const formattedAmount = removeTrailingZeros(amountNumberString, numberOfDecimalsToDisplay)

  return internationalizeAmountString(formattedAmount, region, false)
}

const formatRegularPrecision = (
  amountNumber: number,
  numberOfDecimalsToDisplay: number,
  minNumberOfDecimals: number,
  region: string
): string => {
  if (amountNumber < 0.001) {
    const formattedAmount = removeTrailingZeros(amountNumber.toFixed(5), minNumberOfDecimals)

    return internationalizeAmountString(formattedAmount, region)
  }

  const formattedAmount = removeTrailingZeros(amountNumber.toFixed(numberOfDecimalsToDisplay), minNumberOfDecimals)
  const decimalCount = (formattedAmount.split('.')[1] || '').length

  return new Intl.NumberFormat(region, {
    minimumFractionDigits: decimalCount,
    maximumFractionDigits: decimalCount,
    useGrouping: true,
    notation: Number(formattedAmount) >= 1000000 ? 'compact' : 'standard',
    compactDisplay: 'short'
  }).format(amountNumber)
}

const smartRound = (amountString: string, region: string) => {
  const match = amountString.match(/[1-9]/)
  if (!match) return amountString

  const indexOfFirstNonZero = amountString.indexOf(match[0])

  const firstSignificantDigit = parseInt(match[0])
  const secondSignigicantDigit = parseInt(amountString.charAt(indexOfFirstNonZero + 1))

  if (secondSignigicantDigit >= 5) {
    const roundedUp =
      firstSignificantDigit === 9
        ? amountString.slice(0, indexOfFirstNonZero - 1) + '1'
        : amountString.slice(0, indexOfFirstNonZero) + (firstSignificantDigit + 1).toString()

    return internationalizeAmountString(roundedUp, region)
  }

  const roundedUp = amountString.slice(0, indexOfFirstNonZero + 1)

  return internationalizeAmountString(roundedUp, region)
}

const internationalizeAmountString = (amountString: string, region: string, useGrouping = true) => {
  const decimalCount = amountString.includes('.') ? amountString.split('.')[1].length : 0

  return new Intl.NumberFormat(region, {
    minimumFractionDigits: decimalCount,
    useGrouping
  }).format(Number(amountString))
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

export const toExponential = (num: number | string, region: string, fractionDigits = 0, truncate?: boolean): string => {
  const numValue = typeof num === 'string' ? Number(num) : num

  if (isNaN(numValue)) {
    throw new Error('Invalid input: input cannot be converted to a number.')
  }

  if (!truncate) {
    const formattedNumber = new Intl.NumberFormat(region, {
      notation: 'scientific',
      minimumFractionDigits: fractionDigits
    })
      .format(numValue)
      .toLocaleLowerCase()

    // Add + sign for positive exponents
    return formattedNumber.replace('e', () => {
      const exponentPart = formattedNumber.split('e')[1]
      return exponentPart.startsWith('-') ? 'e' : 'e+'
    })
  }

  const expStr = numValue.toExponential()
  const [base, exponent] = expStr.split('e')
  const decimalIndex = base.indexOf('.')

  let returnedBase = base

  if (decimalIndex !== -1) {
    returnedBase = base.slice(0, decimalIndex + fractionDigits + 1)
  }

  return `${internationalizeAmountString(returnedBase, region)}e${exponent}`
}

export const aboveExpLimit = (num: number | string): boolean => {
  const baseStr = '999999999999999999' // 999'999 trillions
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

export const calculateTokenAmountWorth = (amount: bigint, fiatPrice: number, decimals: number): number => {
  if (fiatPrice < 0) throw `Invalid fiat price: ${fiatPrice}. Fiat price cannot be negative.`

  return fiatPrice * parseFloat(toHumanReadableAmount(amount, decimals))
}

const isPositiveInt = (number: number) => Number.isInteger(number) && number >= 0

export const getNumberOfDecimals = (amount: string): number =>
  amount.includes('.') ? amount.length - 1 - amount.indexOf('.') : 0

export const convertToPositive = (num: bigint): bigint => (num < 0 ? num * BigInt(-1) : num)
