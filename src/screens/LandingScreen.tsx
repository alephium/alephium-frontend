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

import Button from '../components/Button'
import ButtonStack from '../components/ButtonStack'

const LandingScreen = ({ style }: { style: StyleProp<ViewStyle> }) => (
  <View style={style}>
    <TitleContainer>
      <TitleFirstLine>Welcome to the official</TitleFirstLine>
      <TitleSecondLine>Alephium Wallet</TitleSecondLine>
    </TitleContainer>
    <ActionContainer>
      <ButtonStack>
        <Button title="New wallet" type="primary" />
        <Button title="Import wallet" type="secondary" />
      </ButtonStack>
    </ActionContainer>
  </View>
)

export default styled(LandingScreen)`
  flex: 1;
  background-color: ${({ theme }) => theme.bg.secondary};
  justify-content: center;
  align-items: center;
`

const TitleContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const TitleFirstLine = styled(Text)`
  font-weight: bold;
`

const TitleSecondLine = styled(Text)``

const ActionContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`
