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
import { Dimensions, LayoutChangeEvent } from 'react-native'
import Animated from 'react-native-reanimated'
import styled, { ThemeProvider, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import ActionButtonsStack from '~/components/buttons/ActionButtonsStack'
import Button from '~/components/buttons/Button'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import { useAppDispatch } from '~/hooks/redux'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { getWalletMetadata } from '~/persistent-storage/wallet'
import { methodSelected, WalletGenerationMethod } from '~/store/walletGenerationSlice'
import { BORDER_RADIUS_BIG, BORDER_RADIUS_HUGE } from '~/style/globalStyle'
import { themes } from '~/style/themes'

interface LandingScreenProps extends StackScreenProps<RootStackParamList, 'LandingScreen'>, ScreenProps {}

const LandingScreen = ({ navigation, ...props }: LandingScreenProps) => {
  const dispatch = useAppDispatch()

  const { width, height } = Dimensions.get('window')
  const [dimensions, setDimensions] = useState({ width, height })
  const [showNewWalletButtons, setShowNewWalletButtons] = useState(false)

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
              r={dimensions.width * 1.5}
              colors={['#ee5353', '#ffa274', '#75b0ec']}
            />
          </Rect>
        </CanvasStyled>
        <LogoContainer>
          <AlephiumLogoStyled color="#ffffff" />
        </LogoContainer>
        <TitleContainer>
          <TitleFirstLine>Welcome to</TitleFirstLine>
          <TitleSecondLine>Alephium</TitleSecondLine>
        </TitleContainer>

        {showNewWalletButtons && (
          <ButtonsArea>
            <ButtonsContainer>
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
            </ButtonsContainer>
          </ButtonsArea>
        )}
      </Screen>
    </ThemeProvider>
  )
}

export default LandingScreen

const LogoContainer = styled(Animated.View)`
  flex: 2;
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
  font-size: 24px;
  color: #ffffff;
`

const TitleSecondLine = styled(AppText)`
  font-size: 28px;
  font-weight: bold;
  color: #ffffff;
`

const CanvasStyled = styled(Canvas)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
`

const ButtonsArea = styled.View`
  flex: 1.5;
`

const ButtonsContainer = styled.View`
  padding: 22px 20px;
  margin: 20px;
  border-radius: ${BORDER_RADIUS_HUGE}px;
  background-color: ${({ theme }) => theme.bg.contrast};
  gap: 16px;
`
