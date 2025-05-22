import { StackScreenProps } from '@react-navigation/stack'
import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import animationSrc from '~/animations/lottie/wallet.json'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import { ScreenProps } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import i18n from '~/features/localization/i18n'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface ImportWalletAddressDiscoveryScreenProps
  extends StackScreenProps<RootStackParamList, 'ImportWalletAddressDiscoveryScreen'>,
    ScreenProps {}

const instructions: Instruction[] = [
  { text: i18n.t("Let's take a minute to scan for your active addresses"), type: 'primary' },
  {
    text: i18n.t(
      'Scan the blockchain to find addresses that you used in the past. This should take less than a minute.'
    ),
    type: 'secondary'
  }
]

const ImportWalletAddressDiscoveryScreen = ({ navigation, ...props }: ImportWalletAddressDiscoveryScreenProps) => {
  const { t } = useTranslation()

  const handleLaterPress = () => {
    sendAnalytics({ event: 'Skipped address discovery' })

    navigation.navigate('NewWalletSuccessScreen')
  }

  return (
    <ScrollScreen
      fill
      headerOptions={{ headerTitle: t('Active addresses'), type: 'stack' }}
      contentPaddingTop
      {...props}
    >
      <AnimationContainer>
        <StyledAnimation source={animationSrc} autoPlay speed={1.2} style={{ width: '45%' }} />
      </AnimationContainer>
      <CenteredInstructions instructions={instructions} stretch />
      <BottomButtons>
        <Button
          title={t('Scan')}
          type="primary"
          variant="contrast"
          onPress={() => navigation.navigate('AddressDiscoveryScreen', { isImporting: true, startScanning: true })}
        />
        <Button title={t('Later')} type="primary" onPress={handleLaterPress} />
      </BottomButtons>
    </ScrollScreen>
  )
}

export default ImportWalletAddressDiscoveryScreen

const AnimationContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const StyledAnimation = styled(LottieView)`
  width: 60%;
  height: 100%;
`
