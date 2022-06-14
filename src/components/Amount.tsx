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

interface AmountProps {
  value: bigint | undefined
  style?: StyleProp<ViewStyle>
  fadeDecimals?: boolean
  fullPrecision?: boolean
  prefix?: string
}

const Amount = ({ value, style, fadeDecimals, fullPrecision = false, prefix }: AmountProps) => {
  let integralPart = ''
  let fractionalPart = ''
  let suffix = ''
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)

  if (!discreetMode && value !== undefined) {
    let amount = formatAmountForDisplay(value, fullPrecision)
    if (fadeDecimals && ['K', 'M', 'B', 'T'].some((char) => amount.endsWith(char))) {
      suffix = amount.slice(-1)
      amount = amount.slice(0, -1)
    }
    const amountParts = amount.split('.')
    integralPart = amountParts[0]
    fractionalPart = amountParts[1]
  }

  return (
    <Text style={style}>
      {discreetMode ? (
        '•••'
      ) : value !== undefined ? (
        fadeDecimals ? (
          <>
            {prefix && <Text>{prefix}</Text>}
            <Text>{integralPart}</Text>
            <Decimals>.{fractionalPart}</Decimals>
            {suffix && <Text>{suffix}</Text>}
          </>
        ) : (
          `${integralPart}.${fractionalPart}`
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
