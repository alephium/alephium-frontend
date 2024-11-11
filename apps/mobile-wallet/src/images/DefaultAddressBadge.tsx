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

import { Canvas, FitBox, Path, rect } from '@shopify/react-native-skia'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

interface DefaultAddressBadgeProps {
  color?: string
  size?: number
  style?: StyleProp<ViewStyle>
}

const DefaultAddressBadge = ({ size = 24, color = 'blue', ...props }: DefaultAddressBadgeProps) => (
  <DefaultAddressBadgeStyled size={size} color={color} {...props}>
    <StarShape size={size - 4} color="white" />
  </DefaultAddressBadgeStyled>
)

const StarShape = ({ size, color = 'white' }: { size: number; color: string }) => {
  const path = 'M12 1L15.5 8L24 9L17.5 14L19 22L12 18L5 22L6.5 14L0 9L8.5 8L12 1Z'

  return (
    <Canvas style={{ width: size, height: size }}>
      <FitBox src={rect(0, 0, 24, 24)} dst={rect(0, 0, size, size)}>
        <Path path={path} color={color} style="fill" />
      </FitBox>
    </Canvas>
  )
}

export default DefaultAddressBadge

const DefaultAddressBadgeStyled = styled.View<DefaultAddressBadgeProps>`
  justify-content: center;
  align-items: center;
  border-radius: ${({ size }) => size! / 2}px;
  background-color: ${({ color }) => color};
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
`
