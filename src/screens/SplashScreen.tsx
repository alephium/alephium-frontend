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
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import GradientBackground from '../components/GradientBackground'
import Screen from '../components/layout/Screen'
import RootStackParamList from '../navigation/rootStackRoutes'
import { AlephiumLogoStyled } from '../screens/LandingScreen'

type ScreenProps = StackScreenProps<RootStackParamList, 'SplashScreen'>

const SplashScreen = ({ navigation }: { style: StyleProp<ViewStyle> } & ScreenProps) => {
  console.log('SplashScreen renders')

  return (
    <Screen>
      <LogoContainer>
        <AlephiumLogoStyled />
      </LogoContainer>
      <GradientBackground />
    </Screen>
  )
}

export default styled(SplashScreen)`
  flex: 1;
`

const LogoContainer = styled.View`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`
