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

import { StackScreenProps } from '@react-navigation/stack'
import { Canvas, RadialGradient, Rect, vec } from '@shopify/react-native-skia'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import { Dimensions, Image, LayoutChangeEvent } from 'react-native'
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { ThemeProvider } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import { useAppDispatch } from '~/hooks/redux'
import moonImageSrc from '~/images/illustrations/moon_rocket.png'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { getWalletMetadata } from '~/persistent-storage/wallet'
import { methodSelected, WalletGenerationMethod } from '~/store/walletGenerationSlice'
import { BORDER_RADIUS_BIG, BORDER_RADIUS_HUGE } from '~/style/globalStyle'
import { themes } from '~/style/themes'

interface LandingScreenProps extends StackScreenProps<RootStackParamList, 'LandingScreen'>, ScreenProps {}

const LandingScreen = ({ navigation, ...props }: LandingScreenProps) => {
  const dispatch = useAppDispatch()
  const insets = useSafeAreaInsets()

  const { width, height } = Dimensions.get('window')
  const [dimensions, setDimensions] = useState({ width, height })
  const [showNewWalletButtons, setShowNewWalletButtons] = useState(false)
  const [isMoonShown, setIsMoonShown] = useState(false)

  const gradientRadius = useSharedValue(0)

  useEffect(() => {
    gradientRadius.value = withDelay(200, withSpring(dimensions.width * 2, { mass: 3, stiffness: 60, damping: 40 }))
  }, [dimensions.width, gradientRadius])

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: withSpring(isMoonShown ? '180deg' : '0deg') }],
    opacity: withSpring(isMoonShown ? 0 : 1)
  }))

  const moonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: withSpring(isMoonShown ? '0deg' : '180deg') }],
    opacity: withSpring(isMoonShown ? 1 : 0)
  }))

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

  return (
    <ThemeProvider theme={themes.dark}>
      <Screen contrastedBg {...props} onLayout={handleScreenLayoutChange}>
        <CanvasStyled onLayout={() => SplashScreen.hideAsync()}>
          <Rect x={0} y={0} width={dimensions.width} height={dimensions.height}>
            <RadialGradient
              c={vec(dimensions.width / 2, dimensions.height)}
              r={gradientRadius}
              colors={['#ee5368', '#ff8974', '#ffc074', '#7aa8cb', '#0c306a', '#030f33']}
              positions={[0.1, 0.3, 0.5, 0.7, 0.9, 1]}
            />
          </Rect>
        </CanvasStyled>
        <LogoContainer onTouchEnd={() => setIsMoonShown(!isMoonShown)}>
          <LogoArea entering={FadeIn.delay(200).duration(500)} style={[logoAnimatedStyle]}>
            <AlephiumLogo color="white" style={{ width: '20%' }} />
          </LogoArea>
          <MoonArea style={moonAnimatedStyle}>
            <MoonImage source={moonImageSrc} style={{ resizeMode: 'center', objectFit: 'contain' }} />
          </MoonArea>
        </LogoContainer>

        {showNewWalletButtons && (
          <BottomArea style={{ marginBottom: insets.bottom }} entering={FadeIn.delay(500).duration(500)}>
            <TitleContainer>
              <TitleFirstLine>Welcome to</TitleFirstLine>
              <TitleSecondLine>Alephium 👋</TitleSecondLine>
            </TitleContainer>
            <ButtonsContainer>
              <Button
                title="New wallet"
                type="primary"
                onPress={() => handleButtonPress('create')}
                variant="highlight"
                iconProps={{ name: 'flower-outline' }}
              />
              <Button
                title="Import wallet"
                onPress={() => handleButtonPress('import')}
                iconProps={{ name: 'download-outline' }}
              />
            </ButtonsContainer>
          </BottomArea>
        )}
      </Screen>
    </ThemeProvider>
  )
}

export default LandingScreen

const LogoContainer = styled(Animated.View)`
  position: relative;
  flex: 2;
  justify-content: center;
  align-items: center;
`

const LogoArea = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
`

const MoonArea = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
`

const MoonImage = styled(Image)`
  width: 40%;
  height: 40%;
`

const CanvasStyled = styled(Canvas)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
`

const BottomArea = styled(Animated.View)`
  flex: 1.2;
  margin: 10px;
  border-radius: ${BORDER_RADIUS_HUGE}px;
  background-color: ${({ theme }) => theme.bg.back2};
  overflow: hidden;
`

const TitleContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  border-radius: ${BORDER_RADIUS_BIG}px;
  background-color: ${({ theme }) => theme.bg.primary};
  margin: 22px 22px 0 22px;
`

const TitleFirstLine = styled(AppText)`
  font-size: 22px;
  color: #ffffff;
`

const TitleSecondLine = styled(AppText)`
  font-size: 26px;
  font-weight: bold;
  color: #ffffff;
`

const ButtonsContainer = styled(Animated.View)`
  gap: 16px;
  padding: 22px;
`
