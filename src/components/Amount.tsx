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

import { convertToPositive, formatAmountForDisplay, formatFiatAmountForDisplay } from '@alephium/sdk'
import { StyleProp, TextStyle } from 'react-native'

import { useAppSelector } from '~/hooks/redux'

import AppText, { AppTextProps } from './AppText'

interface AmountProps extends AppTextProps {
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
  style?: StyleProp<TextStyle>
}

const Amount = ({
  value,
  fadeDecimals,
  fullPrecision = false,
  suffix = '',
  showOnDiscreetMode = false,
  isFiat = false,
  color: colorProp,
  size,
  bold,
  style,
  isUnknownToken,
  decimals,
  nbOfDecimalsToShow,
  showPlusMinus,
  highlight,
  colorTheme
}: AmountProps) => {
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)

  let quantitySymbol = ''
  let amount = ''
  let isNegative = false

  if (value !== undefined) {
    if (isFiat && typeof value === 'number') {
      amount = formatFiatAmountForDisplay(value)
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

  const [integralPart, fractionalPart] = amount.split('.')

  const color = colorProp ?? (highlight && value !== undefined ? (value < 0 ? 'highlight' : 'valid') : 'primary')
  const fadedColor = fadeDecimals ? 'secondary' : color

  return (
    <AppText {...{ bold, size, color, colorTheme }} style={style}>
      {discreetMode && !showOnDiscreetMode ? (
        '•••'
      ) : integralPart ? (
        <>
          {showPlusMinus && <AppText {...{ color, colorTheme }}>{isNegative ? '-' : '+'}</AppText>}
          <AppText {...{ color, colorTheme }}>{integralPart}</AppText>
          <AppText color={fadedColor} colorTheme={colorTheme}>{`.${fractionalPart} `}</AppText>
          {quantitySymbol && <AppText color={fadedColor} colorTheme={colorTheme}>{`${quantitySymbol} `}</AppText>}
          {!isUnknownToken && <AppText {...{ color, colorTheme }}>{` ${suffix ?? 'ALPH'}`}</AppText>}
        </>
      ) : (
        '-'
      )}
    </AppText>
  )
}

export default Amount
