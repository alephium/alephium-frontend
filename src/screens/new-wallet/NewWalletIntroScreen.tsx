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

import { StackScreenProps } from '@react-navigation/stack'
import LottieView from 'lottie-react-native'
import { Text } from 'react-native'
import styled from 'styled-components/native'

import Button from '../../components/buttons/Button'
import ButtonStack from '../../components/buttons/ButtonStack'
import Screen from '../../components/layout/Screen'
import RootStackParamList from '../../navigation/rootStackRoutes'

const animationSrc = require('../../animations/wallet.json')

type ScreenProps = StackScreenProps<RootStackParamList, 'NewWalletNameScreen'>

const NewWalletNameScreen = ({ navigation }: ScreenProps) => {
  return (
    <Screen>
      <AnimationContainer>
        <StyledAnimation source={animationSrc} autoPlay />
      </AnimationContainer>
      <TitleContainer>
        <TitleFirstLine>You are about to create a wallet 🎉</TitleFirstLine>
        <TitleSecondLine>Your gateway to the Alephium ecosystem</TitleSecondLine>
      </TitleContainer>
      <ActionsContainer>
        <ButtonStack>
          <Button title="Let's go!" type="primary" onPress={() => navigation.navigate('NewWalletNameScreen')} />
          <Button title="Cancel" type="secondary" onPress={() => navigation.goBack()} />
        </ButtonStack>
      </ActionsContainer>
    </Screen>
  )
}

const AnimationContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const StyledAnimation = styled(LottieView)`
  width: 40%;
`

const TitleContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const TitleFirstLine = styled(Text)`
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: bold;
`

const TitleSecondLine = styled(Text)`
  font-size: 16px;
  color: ${({ theme }) => theme.font.secondary};
`

const ActionsContainer = styled.View`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`

export default NewWalletNameScreen
