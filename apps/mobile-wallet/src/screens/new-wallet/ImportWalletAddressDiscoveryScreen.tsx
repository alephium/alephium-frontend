import { useIsExplorerOffline } from '@alephium/shared-react'
import { StackScreenProps } from '@react-navigation/stack'
import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import animationSrc from '~/animations/lottie/wallet.json'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import { ScreenProps } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import CenteredInstructions from '~/components/text/CenteredInstructions'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface ImportWalletAddressDiscoveryScreenProps
  extends StackScreenProps<RootStackParamList, 'ImportWalletAddressDiscoveryScreen'>,
    ScreenProps {}

const ImportWalletAddressDiscoveryScreen = ({ navigation, ...props }: ImportWalletAddressDiscoveryScreenProps) => {
  const { t } = useTranslation()

  const handleContinuePress = () => navigation.navigate('NewWalletSuccessScreen')
  const handleScanPress = () =>
    navigation.navigate('AddressDiscoveryScreen', { isImporting: true, startScanning: true })

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
      <ScreenContent onContinuePress={handleContinuePress} onScanPress={handleScanPress} />
    </ScrollScreen>
  )
}

export default ImportWalletAddressDiscoveryScreen

interface ScreenContentProps {
  onContinuePress: () => void
  onScanPress: () => void
}

const ScreenContent = ({ onContinuePress, onScanPress }: ScreenContentProps) => {
  const { t } = useTranslation()
  const isExplorerOffline = useIsExplorerOffline()

  if (isExplorerOffline) {
    return (
      <>
        <CenteredInstructions
          instructions={[
            { text: t('Scan for active addresses'), type: 'primary' },
            {
              text: t(
                'When you re-establish an internet connection, you can go to your app settings to scan the blockchain to find addresses that you used in the past.'
              ),
              type: 'secondary'
            }
          ]}
          stretch
        />
        <BottomButtons>
          <Button title={t('Continue')} type="primary" onPress={onContinuePress} />
        </BottomButtons>
      </>
    )
  }

  return (
    <>
      <CenteredInstructions
        instructions={[
          { text: t("Let's take a minute to scan for your active addresses"), type: 'primary' },
          {
            text: t(
              'Scan the blockchain to find addresses that you used in the past. This should take less than a minute.'
            ),
            type: 'secondary'
          }
        ]}
        stretch
      />
      <BottomButtons>
        <Button title={t('Scan')} type="primary" variant="contrast" onPress={onScanPress} />
      </BottomButtons>
    </>
  )
}

const AnimationContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const StyledAnimation = styled(LottieView)`
  width: 60%;
  height: 100%;
`
