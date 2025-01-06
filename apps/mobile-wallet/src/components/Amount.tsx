import { convertToPositive, formatAmountForDisplay, formatFiatAmountForDisplay } from '@alephium/shared'
import { StyleProp, TextStyle } from 'react-native'

import { useAppSelector } from '~/hooks/redux'

import AppText, { AppTextProps } from './AppText'

export interface AmountProps extends AppTextProps {
  value?: bigint | number
  decimals?: number
  isFiat?: boolean
  fadeDecimals?: boolean
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
}

const Amount = ({
  value,
  fadeDecimals,
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
  ...props
}: AmountProps) => {
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)

  let quantitySymbol = ''
  let amount = ''
  let isNegative = false

  if (value !== undefined) {
    isNegative = value < 0

    if (isFiat && typeof value === 'number') {
      amount = formatFiatAmountForDisplay(isNegative ? value * -1 : value)
    } else if (isUnknownToken) {
      amount = convertToPositive(value as bigint).toString()
    } else {
      amount = formatAmountForDisplay({
        amount: convertToPositive(value as bigint),
        amountDecimals: decimals,
        displayDecimals: nbOfDecimalsToShow,
        fullPrecision
      })
    }

    if (fadeDecimals && ['K', 'M', 'B', 'T'].some((char) => amount.endsWith(char))) {
      quantitySymbol = amount.slice(-1)
      amount = amount.slice(0, -1)
    }
  }

  let [integralPart, fractionalPart] = amount.split('.')

  if (useTinyAmountShorthand && amount.startsWith('0.0000')) {
    integralPart = '< 0'
    fractionalPart = '0001'
  }

  const color = props.color ?? (highlight && value !== undefined ? (value < 0 ? 'send' : 'receive') : 'primary')
  const fadedColor = fadeDecimals ? 'secondary' : color

  return (
    <AppText {...props} {...{ color, style }}>
      {discreetMode && !showOnDiscreetMode ? (
        '•••'
      ) : integralPart ? (
        <>
          {showPlusMinus && (
            <AppText {...props} color={color}>
              {isNegative ? '-' : '+'}
            </AppText>
          )}
          <AppText {...props} color={color}>
            {integralPart}
          </AppText>
          {fractionalPart && <AppText {...props} color={fadedColor}>{`.${fractionalPart}`}</AppText>}
          {quantitySymbol && <AppText {...props} color={fadedColor}>{` ${quantitySymbol} `}</AppText>}
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
