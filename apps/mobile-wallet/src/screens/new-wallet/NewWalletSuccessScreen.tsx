import { NativeStackScreenProps } from '@react-navigation/native-stack'
import LottieView from 'lottie-react-native'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import animationSrc from '~/animations/lottie/success.json'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import CenteredInstructions from '~/components/text/CenteredInstructions'
import { useAppSelector } from '~/hooks/redux'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { storeIsNewWallet } from '~/persistent-storage/wallet'
import { resetNavigation } from '~/utils/navigation'

interface NewWalletSuccessScreenProps
  extends NativeStackScreenProps<RootStackParamList, 'NewWalletSuccessScreen'>,
    ScreenProps {}

const NewWalletSuccessScreen = ({ navigation, ...props }: NewWalletSuccessScreenProps) => {
  const method = useAppSelector((s) => s.walletGeneration.method)
  const wasWalletMetadataRestored = useAppSelector((s) => s.wallet.metadataRestored)
  const theme = useTheme()
  const { t } = useTranslation()

  useEffect(() => {
    try {
      storeIsNewWallet(method === 'create')
    } catch (e) {
      console.error(e)
    }
  }, [method])

  return (
    <Screen safeAreaPadding {...props}>
      <AnimationContainer style={{ marginTop: 100 }}>
        <StyledAlephiumLogo color={theme.font.primary} />
        <StyledAnimation source={animationSrc} autoPlay />
      </AnimationContainer>
      <CenteredInstructions
        instructions={[
          {
            text: `${t(wasWalletMetadataRestored ? 'Welcome back to Alephium!' : 'Welcome to Alephium!')} 🎉`,
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
      <BottomButtons>
        <Button type="primary" variant="highlight" title={t("Let's go!")} onPress={() => resetNavigation(navigation)} />
      </BottomButtons>
    </Screen>
  )
}

export default NewWalletSuccessScreen

const AnimationContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const StyledAlephiumLogo = styled(AlephiumLogo)`
  position: absolute;
  width: 70%;
  height: 60%;
  max-height: 140px;
`

const StyledAnimation = styled(LottieView)`
  width: 80%;
  height: 100%;
`
