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

import Ionicons from '@expo/vector-icons/Ionicons'
import Animated from 'react-native-reanimated'
import styled from 'styled-components/native'

import { PopInFast, PopOutFast } from '~/animations/reanimated/reanimatedAnimations'

const Checkmark = () => (
  <CheckmarkStyled entering={PopInFast} exiting={PopOutFast}>
    <Ionicons name="checkmark-sharp" color="white" size={16} />
  </CheckmarkStyled>
)

const CheckmarkStyled = styled(Animated.View)`
  width: 22px;
  height: 22px;
  border-radius: 22px;
  background-color: ${({ theme }) => theme.global.accent};
  align-items: center;
  justify-content: center;
`

export default Checkmark
