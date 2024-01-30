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

import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import { useAppSelector } from '~/hooks/redux'
import { currencies } from '~/utils/currencies'

interface WorthDeltaProps {
  delta: number
  style?: StyleProp<ViewStyle>
}

const WorthDelta = ({ delta, style }: WorthDeltaProps) => {
  const currency = useAppSelector((s) => s.settings.currency)

  const isInvalidNumber = isNaN(delta)

  const isUp = delta >= 0
  const textColor = isInvalidNumber ? 'tertiary' : isUp ? 'valid' : 'alert'

  return (
    <WorthDeltaStyled style={style}>
      <Amount
        color={textColor}
        semiBold
        size={18}
        value={delta}
        isFiat
        suffix={currencies[currency].symbol}
        showPlusMinus
      />
    </WorthDeltaStyled>
  )
}

export default WorthDelta

const WorthDeltaStyled = styled.View`
  align-items: center;
  flex-direction: row;
  gap: 12px;
  min-width: 10px;
`
