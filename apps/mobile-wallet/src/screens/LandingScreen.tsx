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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { Canvas, Rect, SweepGradient, vec } from '@shopify/react-native-skia'
import { DeviceMotion } from 'expo-sensors'
import * as SplashScreen from 'expo-splash-screen'
import { useCallback, useEffect, useState } from 'react'
import { Dimensions, LayoutChangeEvent } from 'react-native'
import Animated, {
  Extrapolation,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonStack from '~/components/buttons/ButtonStack'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import { useAppDispatch } from '~/hooks/redux'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { getWalletMetadata } from '~/persistent-storage/wallet'
import { methodSelected, WalletGenerationMethod } from '~/store/walletGenerationSlice'

interface LandingScreenProps extends StackScreenProps<RootStackParamList, 'LandingScreen'>, ScreenProps {}

const LandingScreen = ({ navigation, ...props }: LandingScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()

  const { width, height } = Dimensions.get('window')
  const [dimensions, setDimensions] = useState({ width, height })
  const [showNewWalletButtons, setShowNewWalletButtons] = useState(false)
  const [isOverlayVisible, setIsOverlayVisible] = useState(true)

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

      const overlayTimeout = setTimeout(() => {
        setIsOverlayVisible(false)
      }, 200)

      return () => {
        motionsListener.remove()
        clearTimeout(overlayTimeout)
      }
    }, [yAxisRotation, zAxisRotation])
  )

  const handleButtonPress = (method: WalletGenerationMethod) => {
    dispatch(methodSelected(method))
    navigation.navigate('NewWalletIntroScreen')
  }

  const handleScreenLayoutChange = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout

    setDimensions({ width, height })
  }

  useEffect(() => {
    const checkForExistingWallet = async () => {
      const walletMetadata = await getWalletMetadata()

      setShowNewWalletButtons(!walletMetadata)
    }

    checkForExistingWallet()
  }, [])

  const mainbgColor = theme.name === 'light' ? '#fff' : '#000'
  const logoColor = theme.name === 'dark' ? '#fff' : '#000'

  return (
    <Screen contrastedBg {...props} onLayout={handleScreenLayoutChange}>
      <CanvasStyled onLayout={() => SplashScreen.hideAsync()}>
        <Rect x={0} y={0} width={dimensions.width} height={dimensions.height}>
          <SweepGradient
            c={vec(dimensions.width / 2, dimensions.height / 3.5)}
            start={gradientStart}
            end={gradientEnd}
            colors={[mainbgColor, '#FF4385', '#61A1F6', '#FF7D26', '#FF4385', mainbgColor]}
          />
        </Rect>
      </CanvasStyled>
      <LogoContainer style={logoStyle}>
        <AlephiumLogoStyled color={logoColor} />
      </LogoContainer>
      <TitleContainer>
        <TitleFirstLine>Welcome to</TitleFirstLine>
        <TitleSecondLine>Alephium</TitleSecondLine>
      </TitleContainer>
      <ActionsContainer>
        {showNewWalletButtons && (
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
        )}
      </ActionsContainer>
      {isOverlayVisible && <Overlay exiting={FadeOut.delay(200)} />}
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
  font-size: 26px;
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

const Overlay = styled(Animated.View)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: black;
`
