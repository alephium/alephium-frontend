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

import { formatAmountForDisplay } from '@alephium/sdk'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { useAppSelector } from '../hooks/redux'
import Alef from '../images/icons/Alef'
import { formatFiatAmountForDisplay } from '../utils/numbers'
import AppText from './AppText'

interface AmountProps {
  value?: bigint | number
  fadeDecimals?: boolean
  fullPrecision?: boolean
  prefix?: string
  suffix?: string
  isFiat?: boolean
  showOnDiscreetMode?: boolean
  color?: string
  size?: number
  bold?: boolean
  align?: 'left' | 'right'
  style?: StyleProp<ViewStyle>
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
  size = 14,
  bold,
  style
}: AmountProps) => {
  const theme = useTheme()

  let integralPart = ''
  let fractionalPart = ''
  let quantitySymbol = ''
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)

  if (!discreetMode || showOnDiscreetMode) {
    let amount =
      value !== undefined
        ? isFiat && typeof value === 'number'
          ? formatFiatAmountForDisplay(value)
          : formatAmountForDisplay(value as bigint, fullPrecision)
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

  return (
    <View style={style}>
      {discreetMode && !showOnDiscreetMode ? (
        <AppText {...{ bold, size, color }}>•••</AppText>
      ) : integralPart ? (
        <>
          {prefix && <AppText {...{ bold, size, color }}>{`${prefix} `}</AppText>}
          <AppText {...{ bold, size, color }}>{integralPart}</AppText>
          <AppText
            {...{ bold, size }}
            color={fadeDecimals ? theme.font.secondary : color}
          >{`.${fractionalPart} `}</AppText>
          {quantitySymbol && (
            <AppText
              {...{ bold, size }}
              color={fadeDecimals ? theme.font.secondary : color}
            >{`${quantitySymbol} `}</AppText>
          )}
          {!suffix ? (
            <Alef size={size * 0.63} color={color ?? theme.font.secondary} />
          ) : (
            <AppText size={size} color={color ?? theme.font.secondary}>
              {suffix}
            </AppText>
          )}
        </>
      ) : (
        <AppText {...{ bold, size, color }}>-</AppText>
      )}
    </View>
  )
}

export default styled(Amount)`
  flex-direction: row;
  flex: 1;
  align-items: center;
  justify-content: ${({ align }) => (align === 'right' ? 'flex-end' : 'flex-start')};
`
