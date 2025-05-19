import { convertToPositive, formatAmountForDisplay } from '@alephium/shared'
import { useState } from 'react'
import { StyleProp, TextStyle } from 'react-native'

import { useAppSelector } from '~/hooks/redux'

import AppText, { AppTextProps } from './AppText'

// TODO: Refactor to match desktop wallet
export interface AmountProps extends AppTextProps {
  value?: bigint | number
  decimals?: number
  isFiat?: boolean
  fullPrecision?: boolean
  nbOfDecimalsToShow?: number
  suffix?: string
  highlight?: boolean
  isUnknownToken?: boolean
  showPlusMinus?: boolean
  showOnDiscreetMode?: boolean
  fadeSuffix?: boolean
  useTinyAmountShorthand?: boolean
  style?: StyleProp<TextStyle>
  fiatPrefix?: string
}

const Amount = ({
  value,
  fullPrecision = false,
  suffix = '',
  showOnDiscreetMode = false,
  isFiat = false,
  style,
  isUnknownToken,
  decimals,
  nbOfDecimalsToShow,
  showPlusMinus,
  highlight,
  fadeSuffix,
  useTinyAmountShorthand,
  fiatPrefix,
  ...props
}: AmountProps) => {
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)
  const region = useAppSelector((state) => state.settings.region)
  const fiatCurrency = useAppSelector((state) => state.settings.currency)

  const [tappedToDisableDiscreetMode, setTappedToDisableDiscreetMode] = useState(false)

  const hideAmount = discreetMode && !showOnDiscreetMode && !tappedToDisableDiscreetMode

  const handleTappedToDisableDiscreetMode = discreetMode
    ? () => setTappedToDisableDiscreetMode(!tappedToDisableDiscreetMode)
    : undefined

  let amount = ''
  let tinyAmount = ''
  let isNegative = false
  const color = props.color ?? (highlight && value !== undefined ? (value < 0 ? 'send' : 'receive') : 'primary')

  if (value !== undefined) {
    isNegative = value < 0

    if (isFiat && typeof value === 'number') {
      amount = new Intl.NumberFormat(region, { style: 'currency', currency: fiatCurrency }).format(value)

      return (
        <AppText {...props} {...{ color, style }} onPress={handleTappedToDisableDiscreetMode}>
          {hideAmount ? '•••' : fiatPrefix ? `${fiatPrefix} ${amount}` : amount}
        </AppText>
      )
    } else if (isUnknownToken) {
      amount = convertToPositive(value as bigint).toString()
    } else {
      amount = formatAmountForDisplay({
        amount: convertToPositive(value as bigint),
        amountDecimals: decimals,
        displayDecimals: nbOfDecimalsToShow,
        fullPrecision,
        region
      })

      const amountIsTooSmall = formatAmountForDisplay({
        amount: convertToPositive(value as bigint),
        amountDecimals: decimals,
        displayDecimals: nbOfDecimalsToShow,
        fullPrecision
      }).startsWith('0.0000')

      tinyAmount =
        useTinyAmountShorthand && amountIsTooSmall
          ? formatAmountForDisplay({ amount: BigInt(1), amountDecimals: 4, region })
          : ''
    }
  }

  return (
    <AppText {...props} {...{ color, style }} onPress={handleTappedToDisableDiscreetMode}>
      {hideAmount ? (
        '•••'
      ) : amount ? (
        <>
          {showPlusMinus && (
            <AppText {...props} color={color}>
              {isNegative ? '-' : '+'}
            </AppText>
          )}
          <AppText {...props} color={color}>
            {tinyAmount ? `< ${tinyAmount}` : amount}
          </AppText>
          {!isUnknownToken && (
            <AppText {...props} color={fadeSuffix ? 'secondary' : color}>{` ${suffix || 'ALPH'}`}</AppText>
          )}
        </>
      ) : (
        '-'
      )}
    </AppText>
  )
}

export default Amount
