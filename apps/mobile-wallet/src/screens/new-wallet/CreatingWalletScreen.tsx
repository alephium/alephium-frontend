import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { isEnrolledAsync } from 'expo-local-authentication'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import WalletLottieAnimation from '~/animations/lottie/WalletLottieAnimation'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import CenteredInstructions from '~/components/text/CenteredInstructions'
import { useAppSelector } from '~/hooks/redux'
import useCreateWallet from '~/hooks/useCreateWallet'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { showExceptionToast } from '~/utils/layout'
import { sleep } from '~/utils/misc'
import { resetNavigation } from '~/utils/navigation'

const MIN_VISIBLE_DURATION = 1500

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
      <CenteredInstructions instructions={[{ text: t('Creating wallet'), type: 'primary' }]} stretch fontSize={19} />
    </Screen>
  )
}

export default CreatingWalletScreen

const AnimationContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`
