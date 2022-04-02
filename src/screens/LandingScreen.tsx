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

import { StyleProp, Text, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

const LandingScreen = ({ style }: { style: StyleProp<ViewStyle> }) => (
  <View style={style}>
    <Text>Welcome to Alephium!</Text>
  </View>
)

export default styled(LandingScreen)`
  flex: 1;
  background-color: ${({ theme }) => theme.bg.secondary};
  justify-content: center;
  align-items: center;
`
