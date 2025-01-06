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
