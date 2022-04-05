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
import { MotiView } from 'moti'
import { StyleProp, Text, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import Button from '../components/buttons/Button'
import ButtonStack from '../components/buttons/ButtonStack'
import Screen from '../components/layout/Screen'
import GradientBackground from '../images/gradients/GradientBackground'
import AlephiumLogo from '../images/logos/AlephiumLogo'
import RootStackParamList from '../navigation/rootStackRoutes'

type ScreenProps = StackScreenProps<RootStackParamList, 'LandingScreen'>

const LandingScreen = ({ style, navigation }: { style: StyleProp<ViewStyle> } & ScreenProps) => (
  <Screen>
    <LogoContainer>
      <AlephiumLogoStyled />
    </LogoContainer>
    <TitleContainer>
      <TitleFirstLine>Welcome to the official</TitleFirstLine>
      <TitleSecondLine>Alephium Wallet</TitleSecondLine>
    </TitleContainer>
    <ActionsContainer>
      <ButtonStack>
        <Button
          title="New wallet"
          type="primary"
          variant="contrast"
          onPress={() => navigation.navigate('NewWalletNameScreen')}
        />
        <Button title="Import wallet" type="secondary" variant="contrast" />
      </ButtonStack>
    </ActionsContainer>
    <GradientBackgroundStyled
      from={{ scale: 1.2 }}
      animate={{ scale: 3 }}
      transition={{
        loop: true,
        type: 'timing',
        duration: 3000
      }}
    >
      <GradientBackground />
    </GradientBackgroundStyled>
  </Screen>
)

export default styled(LandingScreen)`
  flex: 1;
`

const GradientBackgroundStyled = styled(MotiView)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: -1;
`

const LogoContainer = styled(View)`
  flex: 1.5;
  margin-top: 100px;
`

const AlephiumLogoStyled = styled(AlephiumLogo)`
  padding: 20% 0;
`

const TitleContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const TitleFirstLine = styled(Text)`
  font-size: 18px;
  color: ${({ theme }) => theme.font.contrast};
`

const TitleSecondLine = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.font.contrast};
`

const ActionsContainer = styled.View`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`
