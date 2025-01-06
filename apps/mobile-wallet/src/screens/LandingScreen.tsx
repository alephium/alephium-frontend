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
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StatusBar } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AnimatedBackground from '~/components/AnimatedBackground'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import Screen, { ScreenProps, ScreenSection } from '~/components/layout/Screen'
import ScreenTitle from '~/components/layout/ScreenTitle'
import RoundedCard from '~/components/RoundedCard'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { storedWalletExists } from '~/persistent-storage/wallet'
import { methodSelected, WalletGenerationMethod } from '~/store/walletGenerationSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { resetNavigation } from '~/utils/navigation'

interface LandingScreenProps extends NativeStackScreenProps<RootStackParamList, 'LandingScreen'>, ScreenProps {}

const LandingScreen = ({ navigation, ...props }: LandingScreenProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const theme = useTheme()
  const isWalletUnlocked = useAppSelector((state) => state.wallet.isUnlocked)

  const [isScreenContentVisible, setIsScreenContentVisible] = useState(false)

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

  const handleButtonPress = (method: WalletGenerationMethod) => {
    dispatch(methodSelected(method))
    navigation.navigate('NewWalletIntroScreen')
  }

  return (
    <Screen safeAreaPadding>
      {isScreenContentVisible && (
        <>
          <ScreenSection fill verticalGap>
            <WelcomeCard />
          </ScreenSection>
          <ScreenSection>
            <ButtonsContainer bottomInset fullWidth>
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
          </ScreenSection>
        </>
      )}
    </Screen>
  )
}

export default LandingScreen

const WelcomeCard = () => {
  const { t } = useTranslation()

  const [height, setHeight] = useState(600)

  return (
    <WelcomeCardStyled onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
      <AnimatedBackground isAnimated height={height} width={400} />
      <AlephiumLogo color="white" style={{ width: '20%' }} />
      <ScreenTitle title={t('Welcome to Alephium!')} />
    </WelcomeCardStyled>
  )
}

const WelcomeCardStyled = styled(RoundedCard)`
  flex: 1;
  padding: ${DEFAULT_MARGIN * 2}px;
`

const ButtonsContainer = styled(BottomButtons)`
  gap: 16px;
`
