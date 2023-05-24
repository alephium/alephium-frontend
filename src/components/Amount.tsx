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

import { formatAmountForDisplay, formatFiatAmountForDisplay } from '@alephium/sdk'
import { StyleProp, TextStyle } from 'react-native'

import { useAppSelector } from '~/hooks/redux'

import AppText, { AppTextProps } from './AppText'

interface AmountProps extends AppTextProps {
  value?: bigint | number
  fadeDecimals?: boolean
  fullPrecision?: boolean
  prefix?: string
  suffix?: string
  isFiat?: boolean
  showOnDiscreetMode?: boolean
  style?: StyleProp<TextStyle>
}

const Amount = ({
  value,
  fadeDecimals,
  fullPrecision = false,
  prefix,
  suffix = '',
  showOnDiscreetMode = false,
  isFiat = false,
  color,
  size,
  bold,
  style
}: AmountProps) => {
  let integralPart = ''
  let fractionalPart = ''
  let quantitySymbol = ''
  const discreetMode = useAppSelector((s) => s.settings.discreetMode)

  if (!discreetMode || showOnDiscreetMode) {
    let amount =
      value !== undefined
        ? isFiat && typeof value === 'number'
          ? formatFiatAmountForDisplay(value)
          : formatAmountForDisplay({ amount: value as bigint, fullPrecision })
        : ''

    if (amount) {
      if (fadeDecimals && ['K', 'M', 'B', 'T'].some((char) => amount.endsWith(char))) {
        quantitySymbol = amount.slice(-1)
        amount = amount.slice(0, -1)
      }
      const amountParts = amount.split('.')
      integralPart = amountParts[0]
      fractionalPart = amountParts[1]
    }
  }

  const fadedColor = fadeDecimals ? 'secondary' : color

  return (
    <AppText {...{ bold, size, color }} style={style}>
      {discreetMode && !showOnDiscreetMode ? (
        '•••'
      ) : integralPart ? (
        <>
          {prefix && <AppText color={color}>{`${prefix} `}</AppText>}
          <AppText color={color}>{integralPart}</AppText>
          <AppText color={fadedColor}>{`.${fractionalPart} `}</AppText>
          {quantitySymbol && <AppText color={fadedColor}>{`${quantitySymbol} `}</AppText>}
          <AppText color={fadedColor}>{!suffix ? 'ℵ' : suffix}</AppText>
        </>
      ) : (
        '-'
      )}
    </AppText>
  )
}

export default Amount
