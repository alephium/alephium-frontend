import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { isEnrolledAsync } from 'expo-local-authentication'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Animated, {
  cancelAnimation,
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import WalletLottieAnimation from '~/animations/lottie/WalletLottieAnimation'
import AppText from '~/components/AppText'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import { useAppSelector } from '~/hooks/redux'
import useCreateWallet from '~/hooks/useCreateWallet'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { showExceptionToast } from '~/utils/layout'
import { sleep } from '~/utils/misc'
import { resetNavigation } from '~/utils/navigation'

const MIN_VISIBLE_DURATION = 1500
const ELLIPSIS_STEP_MS = 400

interface CreatingWalletScreenProps
  extends NativeStackScreenProps<RootStackParamList, 'CreatingWalletScreen'>,
    ScreenProps {}

const CreatingWalletScreen = ({ navigation, ...props }: CreatingWalletScreenProps) => {
  const biometricsRequiredForAppAccess = useAppSelector((s) => s.settings.usesBiometrics)
  const createWallet = useCreateWallet()
  const { t } = useTranslation()

  const hasCreationStarted = useRef(false)

  useEffect(() => {
    // Every dependency below can change while creation is in flight, and a re-run would create a second wallet.
    if (hasCreationStarted.current) return

    hasCreationStarted.current = true

    const createWalletAndProceed = async () => {
      try {
        const [, deviceHasEnrolledBiometrics] = await Promise.all([
          createWallet(),
          isEnrolledAsync().catch(() => false),
          sleep(MIN_VISIBLE_DURATION)
        ])

        resetNavigation(
          navigation,
          deviceHasEnrolledBiometrics && !biometricsRequiredForAppAccess
            ? 'AddBiometricsScreen'
            : 'NewWalletSuccessScreen'
        )
      } catch (error) {
        const message = 'Could not generate new wallet'

        showExceptionToast(error, t(message))
        sendAnalytics({ type: 'error', error, message, isSensitive: true })
        navigation.navigate('LandingScreen')
      }
    }

    createWalletAndProceed()
  }, [biometricsRequiredForAppAccess, createWallet, navigation, t])

  return (
    <Screen safeAreaPadding {...props}>
      <AnimationContainer style={{ marginTop: 100 }}>
        <WalletLottieAnimation />
      </AnimationContainer>
      <StatusContainer>
        <StatusLabel bold size={19}>
          {t('Creating wallet')}
        </StatusLabel>
        <AnimatedEllipsis />
      </StatusContainer>
    </Screen>
  )
}

export default CreatingWalletScreen

// Key generation blocks the JS thread, so this must run on the UI thread via Reanimated.
const AnimatedEllipsis = () => {
  const theme = useTheme()
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withRepeat(withTiming(4, { duration: ELLIPSIS_STEP_MS * 4, easing: Easing.linear }), -1, false)

    return () => cancelAnimation(progress)
  }, [progress])

  return (
    <EllipsisRow>
      {[0, 1, 2].map((index) => (
        <EllipsisDot key={index} index={index} progress={progress} color={theme.font.secondary} />
      ))}
    </EllipsisRow>
  )
}

const EllipsisDot = ({ index, progress, color }: { index: number; progress: SharedValue<number>; color: string }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: Math.floor(progress.value) > index ? 1 : 0
  }))

  return (
    <Animated.Text
      style={[{ color, fontSize: 28, fontFamily: 'Geist-Bold', width: 10, textAlign: 'center' }, animatedStyle]}
    >
      .
    </Animated.Text>
  )
}

const AnimationContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const StatusContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  margin: 0 8%;
`

const StatusLabel = styled(AppText)`
  text-align: center;
  margin-bottom: 4px;
`

const EllipsisRow = styled.View`
  flex-direction: row;
  justify-content: center;
  min-height: 32px;
`
