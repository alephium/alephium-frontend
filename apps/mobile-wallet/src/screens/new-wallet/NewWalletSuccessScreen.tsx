import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import SuccessLottieAnimation from '~/animations/lottie/SuccessLottieAnimation'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import CenteredInstructions from '~/components/text/CenteredInstructions'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { storeIsNewWallet } from '~/persistent-storage/wallet'
import { resetNavigation } from '~/utils/navigation'

// The only way off this screen: it has no dismiss button. success.json runs 3s but its last keyframe is
// at frame 89 (~1.5s), so the remainder is a static hold and cutting it short costs no motion.
const AUTO_ADVANCE_DELAY = 2000

interface NewWalletSuccessScreenProps
  extends NativeStackScreenProps<RootStackParamList, 'NewWalletSuccessScreen'>,
    ScreenProps {}

const NewWalletSuccessScreen = ({ navigation, ...props }: NewWalletSuccessScreenProps) => {
  const method = useAppSelector((s) => s.walletGeneration.method)
  const wasWalletMetadataRestored = useAppSelector((s) => s.wallet.metadataRestored)
  const walletId = useAppSelector((s) => s.wallet.id)
  const { t } = useTranslation()

  useEffect(() => {
    try {
      storeIsNewWallet(walletId, method === 'create')
    } catch (e) {
      console.error(e)
    }
  }, [method, walletId])

  useEffect(() => {
    const timeout = setTimeout(() => resetNavigation(navigation), AUTO_ADVANCE_DELAY)

    return () => clearTimeout(timeout)
  }, [navigation])

  return (
    <Screen safeAreaPadding {...props}>
      <AnimationContainer style={{ marginTop: 100 }}>
        <SuccessLottieAnimation loop={false} />
      </AnimationContainer>
      <CenteredInstructions
        instructions={[
          {
            text: `${t(wasWalletMetadataRestored ? 'Welcome back to Alephium!' : 'Welcome to Alephium')}`,
            type: 'primary'
          },
          {
            text: t(wasWalletMetadataRestored ? 'Enjoy your restored wallet!' : 'Enjoy your new wallet!'),
            type: 'secondary'
          }
        ]}
        stretch
        fontSize={19}
      />
    </Screen>
  )
}

export default NewWalletSuccessScreen

const AnimationContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`
