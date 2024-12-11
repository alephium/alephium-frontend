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
import { useCallback, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { StatusBar } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { storedWalletExists } from '~/persistent-storage/wallet'
import { methodSelected, WalletGenerationMethod } from '~/store/walletGenerationSlice'
import { resetNavigation } from '~/utils/navigation'

interface LandingScreenProps extends StackScreenProps<RootStackParamList, 'LandingScreen'> {}

const LandingScreen = ({ navigation }: LandingScreenProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const theme = useTheme()
  const isWalletUnlocked = useAppSelector((state) => state.wallet.isUnlocked)

  const [isScreenContentVisible, setIsScreenContentVisible] = useState(false)
  const rotation = useSharedValue(0)

  useFocusEffect(
    useCallback(() => {
      storedWalletExists()
        .then((walletExists) => {
          if (walletExists) {
            // Normally, when the app is unlocked, this screen is not in focus. However, under certain conditions we end
            // up with an unlocked wallet and no screen in focus at all. This happens when:
            // 1. the auto-lock is set to anything but "Fast"
            // 2. the user manually kills the app before the auto-lock timer completes
            // 3. the WalletConnect feature is activated
            // Since there is no screen in focus and since the default screen set in the RootStackNavigation is this
            // screen, we need to navigate back to the dashboard.
            if (isWalletUnlocked) resetNavigation(navigation)
          } else {
            // Only display this screen's contents when we have no stored wallet. If there is a wallet, the
            // AppUnlockModal will be displayed
            setIsScreenContentVisible(true)
          }
        })
        .catch((error) => {
          sendAnalytics({ type: 'error', error, message: 'Could not determine if stored wallet exists' })
        })
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

  useEffect(() => {
    rotation.value = withRepeat(withTiming(-10, { duration: 400 }), -1, true)
  }, [rotation])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: 20 },
      { translateY: 10 },
      { rotate: `${rotation.value}deg` },
      { translateX: -20 },
      { translateY: -10 }
    ]
  }))

  const handleButtonPress = (method: WalletGenerationMethod) => {
    dispatch(methodSelected(method))
    navigation.navigate('NewWalletIntroScreen')
  }

  return (
    <LandingScreenStyled>
      {isScreenContentVisible && (
        <>
          <TopContainer>
            <AnimatedEmoji style={animatedStyle}>👋</AnimatedEmoji>
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
            </AppText>
          </TopContainer>
          <BottomButtons>
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
          </BottomButtons>
        </>
      )}
    </LandingScreenStyled>
  )
}

export default LandingScreen

const LandingScreenStyled = styled.SafeAreaView`
  flex: 1;
  align-items: center;
`

const TopContainer = styled.View`
  flex: 2;
  align-items: center;
  justify-content: center;
`

const TitleFirstLine = styled(AppText)`
  font-size: 28px;
`

const TitleSecondLine = styled(AppText)`
  font-size: 32px;
  font-weight: bold;
`

const AnimatedEmoji = styled(Animated.Text)`
  font-size: 42px;
  margin-bottom: 30px;
`

const BottomButtons = styled.View`
  gap: 16px;
  padding: 22px 0;
  width: 75%;
`
