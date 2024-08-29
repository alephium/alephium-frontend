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
import { Canvas, RadialGradient, Rect, vec } from '@shopify/react-native-skia'
import { useCallback, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { AppState, Dimensions, Image, LayoutChangeEvent, Platform, StatusBar } from 'react-native'
import Animated, {
  convertToRGBA,
  FadeIn,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSpring
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { ThemeProvider, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import altLogoSrc from '~/images/logos/alephiumHackLogo.png'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { getWalletMetadata, storedWalletExists } from '~/persistent-storage/wallet'
import { methodSelected, WalletGenerationMethod } from '~/store/walletGenerationSlice'
import { BORDER_RADIUS_BIG, BORDER_RADIUS_HUGE } from '~/style/globalStyle'
import { themes } from '~/style/themes'
import { showExceptionToast } from '~/utils/layout'
import { resetNavigation } from '~/utils/navigation'

interface LandingScreenProps extends StackScreenProps<RootStackParamList, 'LandingScreen'>, ScreenProps {}

const gradientColors = ['#eb3d55', '#ff8772', '#ffcd61', '#3a99e2', '#012a6c', '#000044']
const gradientAltColors = ['#1effd6', '#fbe201', '#fb01e6', '#3900aa', '#05064f', '#05064f']

const LandingScreen = ({ navigation, ...props }: LandingScreenProps) => {
  const dispatch = useAppDispatch()
  const insets = useSafeAreaInsets()
  const theme = useTheme()
  const { t } = useTranslation()
  const isWalletUnlocked = useAppSelector((s) => s.wallet.isUnlocked)

  const { width, height } = Dimensions.get('window')
  const [dimensions, setDimensions] = useState({ width, height })
  const [showNewWalletButtons, setShowNewWalletButtons] = useState(false)

  // Normally, when the app is unlocked, this screen is not in focus. However, under certain conditions we end up with
  // an unlocked wallet and no screen in focus at all. This happens when:
  // 1. the auto-lock is set to anything but "Fast"
  // 2. the user manually kills the app before the auto-lock timer completes
  // 3. the WalletConnect feature is activated
  // Since there is no screen in focus and since the default screen set in the RootStackNavigation is this screen, we
  // need to navigate back to the dashboard.
  useFocusEffect(
    useCallback(() => {
      storedWalletExists()
        .then((walletExists) => walletExists && isWalletUnlocked && resetNavigation(navigation))
        .catch((error) => console.error('Could not reset to Dashboard from LandingScreen'))
    }, [isWalletUnlocked, navigation])
  )

  useEffect(() => {
    const unsubscribeBlurListener = navigation.addListener('blur', () => {
      StatusBar.setBarStyle(theme.name === 'light' ? 'dark-content' : 'light-content')
    })

    const unsubscribeFocusListener = navigation.addListener('focus', () => {
      StatusBar.setBarStyle('light-content')
    })

    return () => {
      unsubscribeBlurListener()
      unsubscribeFocusListener()
    }
  }, [navigation, theme.name])

  const handleButtonPress = (method: WalletGenerationMethod) => {
    dispatch(methodSelected(method))
    navigation.navigate('NewWalletIntroScreen')
  }

  const handleScreenLayoutChange = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout

    setDimensions({ width, height })
  }

  useEffect(() => {
    getWalletMetadata()
      .then((metadata) => setShowNewWalletButtons(!metadata))
      .catch((e) => showExceptionToast(e, t('Wallet metadata not found')))
  }, [t])

  return (
    <ThemeProvider theme={themes.dark}>
      <Screen contrastedBg {...props} onLayout={handleScreenLayoutChange}>
        {showNewWalletButtons && (
          <>
            <CoolAlephiumCanvas {...dimensions} />

            <BottomArea
              style={{ marginBottom: insets.bottom + (Platform.OS === 'android' ? 20 : 0) }}
              entering={FadeIn.delay(500).duration(500)}
            >
              <TitleContainer>
                <AppText style={{ textAlign: 'center' }}>
                  <Trans
                    t={t}
                    i18nKey="welcomeToAlephium"
                    components={{
                      0: <TitleFirstLine />,
                      1: <AppText>{'\n'}</AppText>,
                      2: <TitleSecondLine />
                    }}
                  >
                    {'<0>Welcome to</0><1 /><2>Alephium</2>'}
                  </Trans>
                  <TitleSecondLine> 👋</TitleSecondLine>
                </AppText>
              </TitleContainer>
              <ButtonsContainer>
                <Button
                  title={t('New wallet')}
                  type="primary"
                  onPress={() => handleButtonPress('create')}
                  variant="highlight"
                  iconProps={{ name: 'sun' }}
                />
                <Button
                  title={t('Import wallet')}
                  onPress={() => handleButtonPress('import')}
                  iconProps={{ name: 'download' }}
                />
              </ButtonsContainer>
            </BottomArea>
          </>
        )}
      </Screen>
    </ThemeProvider>
  )
}

export default LandingScreen

interface CoolAlephiumCanvasProps {
  width: number
  height: number
  onPress?: () => void
}

export const CoolAlephiumCanvas = ({ width, height, onPress }: CoolAlephiumCanvasProps) => {
  const [appState, setAppState] = useState(AppState.currentState)

  const [isAltLogoShown, setIsAltLogoShown] = useState(false)

  const gradientRadius = useSharedValue(200)
  const gradientColorsAnimationProgress = useSharedValue(1)

  const animatedColors = useDerivedValue(() =>
    gradientColors.map((_, index) =>
      convertToRGBA(
        interpolateColor(
          gradientColorsAnimationProgress.value,
          [0, 1],
          [gradientColors[index], gradientAltColors[index]]
        )
      )
    )
  )

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: withSpring(isAltLogoShown ? '180deg' : '0deg') }],
    opacity: withSpring(isAltLogoShown ? 0 : 1)
  }))

  const altLogoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: withSpring(isAltLogoShown ? '0deg' : '180deg') }],
    opacity: withSpring(isAltLogoShown ? 1 : 0)
  }))

  useEffect(() => {
    gradientRadius.value = withDelay(200, withSpring(width * 2, { mass: 3, stiffness: 60, damping: 40 }))
  }, [width, gradientRadius])

  useEffect(() => {
    gradientColorsAnimationProgress.value = withSpring(isAltLogoShown ? 1 : 0, { mass: 1, stiffness: 90, damping: 10 })
  }, [gradientColorsAnimationProgress, isAltLogoShown])

  const handleScreenPress = () => {
    setIsAltLogoShown(!isAltLogoShown)
    onPress && onPress()
  }

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => setAppState(nextAppState))

    return subscription.remove
  }, [])

  return (
    <>
      <CanvasStyled key={appState}>
        <Rect x={0} y={0} width={width} height={height}>
          <RadialGradient
            c={vec(width / 2, height)}
            r={gradientRadius}
            colors={animatedColors}
            positions={[0.1, 0.3, 0.45, 0.6, 0.8, 1]}
          />
        </Rect>
      </CanvasStyled>
      <LogoContainer onTouchEnd={handleScreenPress} entering={FadeIn.delay(200).duration(500)}>
        <LogoArea style={[logoAnimatedStyle]}>
          <AlephiumLogo color="white" style={{ width: '20%' }} />
        </LogoArea>
        <AltLogoArea style={altLogoAnimatedStyle}>
          <AltLogo source={altLogoSrc} style={{ resizeMode: 'center', objectFit: 'contain' }} />
        </AltLogoArea>
      </LogoContainer>
    </>
  )
}

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

const AltLogoArea = styled(Animated.View)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
`

const AltLogo = styled(Image)`
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
  text-align: center;
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
