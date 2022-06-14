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
import { StyleProp, Text, ViewStyle } from 'react-native'
import styled from 'styled-components'

import { useAppSelector } from '../hooks/redux'
import { formatFiatAmountForDisplay } from '../utils/numbers'

interface AmountProps {
  value?: bigint
  style?: StyleProp<ViewStyle>
  fadeDecimals?: boolean
  fullPrecision?: boolean
  prefix?: string
  suffix?: string
  fiat?: number
}

const Amount = ({ value, style, fadeDecimals, fullPrecision = false, prefix, suffix = '', fiat }: AmountProps) => {
  let integralPart = ''
  let fractionalPart = ''
  let moneySymbol = ''
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)

  if (!discreetMode) {
    let amount = ''

    if (fiat) {
      amount = formatFiatAmountForDisplay(fiat)
    } else if (value !== undefined) {
      amount = formatAmountForDisplay(value, fullPrecision)
    }

    if (amount) {
      if (fadeDecimals && ['K', 'M', 'B', 'T'].some((char) => amount.endsWith(char))) {
        moneySymbol = amount.slice(-1)
        amount = amount.slice(0, -1)
      }
      const amountParts = amount.split('.')
      integralPart = amountParts[0]
      fractionalPart = amountParts[1]
    }
  }

  const displaySuffix = moneySymbol + suffix ? ' ' + suffix : ''

  return (
    <Text style={style}>
      {discreetMode ? (
        '•••'
      ) : integralPart ? (
        fadeDecimals ? (
          <>
            {prefix && <Text>{prefix}</Text>}
            <Text>{integralPart}</Text>
            <Decimals>.{fractionalPart}</Decimals>
            {displaySuffix && <Text>{displaySuffix}</Text>}
          </>
        ) : (
          `${integralPart}.${fractionalPart}${displaySuffix}`
        )
      ) : (
        '-'
      )}
    </Text>
  )
}

const Decimals = styled(Text)`
  color: ${({ theme }) => theme.font.secondary};
  font-weight: bold;
`

export default styled(Amount)`
  font-weight: bold;
`
