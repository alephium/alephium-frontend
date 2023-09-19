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

import { ArrowDownRight, ArrowUpRight } from 'lucide-react-native'
import { StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'

interface DeltaPercentageProps {
  percentage: number
  style?: StyleProp<ViewStyle>
}

const DeltaPercentage = ({ percentage, style }: DeltaPercentageProps) => {
  const theme = useTheme()

  const isInvalidNumber = isNaN(percentage) || percentage > 100 || percentage < -100

  const isUp = percentage >= 0
  const color = isInvalidNumber ? theme.font.secondary : isUp ? theme.global.valid : theme.global.alert
  const textColor = isInvalidNumber ? 'tertiary' : isUp ? 'valid' : 'alert'

  const DirectionArrow = percentage >= 0 ? ArrowUpRight : ArrowDownRight

  return (
    <DeltaPercentageStyled style={style}>
      <DirectionArrow color={color} size={24} />
      <AppText color={textColor} semiBold size={18}>
        {isInvalidNumber ? '-' : percentage}%
      </AppText>
    </DeltaPercentageStyled>
  )
}

export default DeltaPercentage

const DeltaPercentageStyled = styled.View`
  align-items: center;
  flex-direction: row;
  gap: 12px;
  min-width: 10px;
`
