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
import { LinearGradient } from 'expo-linear-gradient'
import { MotiView } from 'moti'
import { StyleProp, Text, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Button from '../components/buttons/Button'
import ButtonStack from '../components/buttons/ButtonStack'
import Screen from '../components/layout/Screen'
import { defaults as generalDefaults, useGlobalContext } from '../contexts/global'
import { useAppDispatch } from '../hooks/redux'
import AlephiumLogo from '../images/logos/AlephiumLogo'
import RootStackParamList from '../navigation/rootStackRoutes'
import { setMethod, WalletGenerationMethod } from '../store/walletGenerationSlice'

type ScreenProps = StackScreenProps<RootStackParamList, 'LandingScreen'>

const LandingScreen = ({ navigation }: { style: StyleProp<ViewStyle> } & ScreenProps) => {
  const { yellow, orange, red, purple, cyan } = useTheme().gradient
  const { setWallet, setWalletName, setPin } = useGlobalContext()
  const dispatch = useAppDispatch()

  const handleButtonPress = (method: WalletGenerationMethod) => {
    dispatch(setMethod(method))
    setWalletName(generalDefaults.walletName)
    setPin(generalDefaults.pin)
    setWallet(undefined)
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
      <GradientBackgroundStyled
        from={{ scale: 1 }}
        animate={{ scale: 2 }}
        transition={{
          loop: true,
          type: 'timing',
          duration: 2000
        }}
      >
        <LinearGradient colors={[yellow, orange, red, purple, cyan]} style={{ width: '100%', height: '100%' }} />
      </GradientBackgroundStyled>
    </Screen>
  )
}

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
  justify-content: center;
  align-items: center;
`

const AlephiumLogoStyled = styled(AlephiumLogo)`
  width: 20%;
  min-width: 40px;
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
