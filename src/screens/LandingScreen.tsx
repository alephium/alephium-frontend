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

import AppText from '../components/AppText'
import Button from '../components/buttons/Button'
import ButtonStack from '../components/buttons/ButtonStack'
import GradientBackground from '../components/GradientBackground'
import Screen from '../components/layout/Screen'
import { useAppDispatch } from '../hooks/redux'
import AlephiumLogo from '../images/logos/AlephiumLogo'
import RootStackParamList from '../navigation/rootStackRoutes'
import { methodSelected, WalletGenerationMethod } from '../store/walletGenerationSlice'

type ScreenProps = StackScreenProps<RootStackParamList, 'LandingScreen'>

const LandingScreen = ({ navigation }: { style: StyleProp<ViewStyle> } & ScreenProps) => {
  const dispatch = useAppDispatch()

  const handleButtonPress = (method: WalletGenerationMethod) => {
    dispatch(methodSelected(method))
    navigation.navigate('NewWalletIntroScreen')
  }

  return (
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
          <Button title="New wallet" type="primary" variant="contrast" onPress={() => handleButtonPress('create')} />
          <Button
            title="Import wallet"
            type="secondary"
            variant="contrast"
            onPress={() => handleButtonPress('import')}
          />
        </ButtonStack>
      </ActionsContainer>
      <GradientBackground />
    </Screen>
  )
}

export default styled(LandingScreen)`
  flex: 1;
`

const LogoContainer = styled.View`
  flex: 1.5;
  margin-top: 100px;
  justify-content: center;
  align-items: center;
`

export const AlephiumLogoStyled = styled(AlephiumLogo)`
  width: 20%;
  min-width: 40px;
`

const TitleContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const TitleFirstLine = styled(AppText)`
  font-size: 18px;
  color: ${({ theme }) => theme.font.contrast};
`

const TitleSecondLine = styled(AppText)`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.font.contrast};
`

const ActionsContainer = styled.View`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`
