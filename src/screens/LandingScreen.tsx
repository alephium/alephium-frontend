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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { Canvas, Rect, SweepGradient, vec } from '@shopify/react-native-skia'
import { DeviceMotion } from 'expo-sensors'
import { useCallback, useEffect, useState } from 'react'
import { Dimensions, LayoutChangeEvent } from 'react-native'
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated'
import styled from 'styled-components/native'

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

  const { width, height } = Dimensions.get('window')
  const [dimensions, setDimensions] = useState({ width, height })

  const yAxisRotation = useSharedValue(0)
  const zAxisRotation = useSharedValue(0)

  const gradientStart = useDerivedValue(() =>
    interpolate(yAxisRotation.value + zAxisRotation.value, [1, 3], [0, 160], Extrapolation.CLAMP)
  )

  const gradientEnd = useDerivedValue(() =>
    interpolate(yAxisRotation.value + zAxisRotation.value, [-1, 2], [50, 290], Extrapolation.CLAMP)
  )

  const logoRotation = useDerivedValue(() => -yAxisRotation.value * 10)

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${logoRotation.value}deg` }]
  }))

  useFocusEffect(
    useCallback(() => {
      const motionsListener = DeviceMotion.addListener((motionData) => {
        yAxisRotation.value = motionData.rotation?.gamma
        zAxisRotation.value = motionData.rotation?.beta
      })

      return () => motionsListener.remove()
    }, [yAxisRotation, zAxisRotation])
  )

  const handleButtonPress = (method: WalletGenerationMethod) => {
    dispatch(methodSelected(method))
    navigation.navigate('NewWalletIntroScreen')
  }

  useEffect(() => {
    const routesHistory = navigation.getState().routes.map((route) => route.name)
    const previousRouteName = routesHistory.length > 1 ? routesHistory[routesHistory.length - 2] : undefined

    if (!previousRouteName || previousRouteName === 'SplashScreen') navigation.setOptions({ headerShown: false })
  }, [navigation])

  const handleScreenLayoutChange = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout

    setDimensions({ width, height })
  }

  return (
    <Screen contrastedBg {...props} onLayout={handleScreenLayoutChange}>
      <CanvasStyled>
        <Rect x={0} y={0} width={dimensions.width} height={dimensions.height}>
          <SweepGradient
            c={vec(dimensions.width / 2, dimensions.height / 3.5)}
            start={gradientStart}
            end={gradientEnd}
            colors={['#ffffff', '#FF4385', '#61A1F6', '#FF7D26', '#FF4385', '#ffffff']}
          />
        </Rect>
      </CanvasStyled>
      <LogoContainer style={logoStyle}>
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

const LogoContainer = styled(Animated.View)`
  flex: 1.5;
  margin-top: 100px;
  justify-content: center;
  align-items: center;
`

export const AlephiumLogoStyled = styled(AlephiumLogo)`
  width: 20%;
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
