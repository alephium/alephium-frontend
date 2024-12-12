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

import { colord } from 'colord'
import { CameraOff } from 'lucide-react-native'
import { DimensionValue } from 'react-native'
import styled from 'styled-components/native'

import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'

interface NFTPlaceholderProps {
  size?: DimensionValue
}

const NFTPlaceholder = ({ size = '100%' }: NFTPlaceholderProps) => (
  <NoImage style={{ width: size, height: size }}>
    <CameraOff color="gray" size="30%" />
  </NoImage>
)

export default NFTPlaceholder

const NoImage = styled.View`
  border-radius: ${BORDER_RADIUS_SMALL}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => colord(theme.bg.back2).darken(0.07).toHex()};
`
