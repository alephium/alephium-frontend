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
    if (isFiat && typeof value === 'number') {
      isNegative = value < 0
      amount = formatFiatAmountForDisplay(isNegative ? value * -1 : value)
    } else if (isUnknownToken) {
      amount = value.toString()
    } else {
      isNegative = value < 0
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
