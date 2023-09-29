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
import { Canvas, Rect, SweepGradient, vec } from '@shopify/react-native-skia'
import { useEffect } from 'react'
import { useWindowDimensions } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonStack from '~/components/buttons/ButtonStack'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import { useAppDispatch } from '~/hooks/redux'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { methodSelected, WalletGenerationMethod } from '~/store/walletGenerationSlice'

interface LandingScreenProps extends StackScreenProps<RootStackParamList, 'LandingScreen'>, ScreenProps {}

const LandingScreen = ({ navigation, ...props }: LandingScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const dimensions = useWindowDimensions()

  const handleButtonPress = (method: WalletGenerationMethod) => {
    dispatch(methodSelected(method))
    navigation.navigate('NewWalletIntroScreen')
  }

  useEffect(() => {
    const routesHistory = navigation.getState().routes.map((route) => route.name)
    const previousRouteName = routesHistory.length > 1 ? routesHistory[routesHistory.length - 2] : undefined

    if (!previousRouteName || previousRouteName === 'SplashScreen') navigation.setOptions({ headerShown: false })
  }, [navigation])

  return (
    <Screen contrastedBg {...props}>
      <CanvasStyled>
        <Rect x={0} y={0} width={dimensions.width} height={dimensions.height}>
          <SweepGradient
            c={vec(dimensions.width / 2, dimensions.height / 3.5)}
            colors={['#FF4385', '#61A1F6', '#FF7D26', '#FF4385']}
          />
        </Rect>
      </CanvasStyled>
      <LogoContainer>
        <AlephiumLogoStyled color="black" />
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
            onPress={() => handleButtonPress('create')}
            variant="contrast"
            iconProps={{ name: 'flower-outline' }}
          />
          <Button
            title="Import wallet"
            onPress={() => handleButtonPress('import')}
            variant="contrast"
            iconProps={{ name: 'download-outline' }}
          />
        </ButtonStack>
      </ActionsContainer>
    </Screen>
  )
}

export default LandingScreen

const LogoContainer = styled.View`
  flex: 1.5;
  margin-top: 100px;
  justify-content: center;
  align-items: center;
`

export const AlephiumLogoStyled = styled(AlephiumLogo)`
  width: 23%;
`

const TitleContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const TitleFirstLine = styled(AppText)`
  font-size: 20px;
  color: black;
`

const TitleSecondLine = styled(AppText)`
  font-size: 20px;
  font-weight: bold;
  color: black;
`

const ActionsContainer = styled.View`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`

const CanvasStyled = styled(Canvas)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
`
