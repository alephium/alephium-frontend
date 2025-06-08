import { useFocusEffect } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StatusBar } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import ScreenAnimatedBackground from '~/components/animatedBackground/ScreenAnimatedBackground'
import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import Screen, { ScreenProps, ScreenSection } from '~/components/layout/Screen'
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
                iconProps={{ name: 'sunny-outline' }}
              />
              <Button
                title={t('Import wallet')}
                onPress={() => handleButtonPress('import')}
                iconProps={{ name: 'download-outline' }}
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
  const theme = useTheme()

  return (
    <WelcomeCardStyled>
      <ScreenAnimatedBackground isAnimated isFullScreen />
      <AlephiumLogo color={theme.font.primary} style={{ width: '20%', height: 200, flex: 0 }} />
      <Title size={32} semiBold>
        {t('Welcome to Alephium')}
      </Title>
    </WelcomeCardStyled>
  )
}

const WelcomeCardStyled = styled(RoundedCard)`
  flex: 1;
  padding: ${DEFAULT_MARGIN * 2}px;
  justify-content: center;
  align-items: center;
`

const Title = styled(AppText)`
  text-align: center;
`

const ButtonsContainer = styled(BottomButtons)`
  gap: 16px;
`
