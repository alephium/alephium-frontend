import { StackScreenProps } from '@react-navigation/stack'
import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import animationSrc from '~/animations/lottie/fingerprint.json'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import { ScreenProps } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import i18n from '~/features/localization/i18n'
import { openModal } from '~/features/modals/modalActions'
import { allBiometricsEnabled } from '~/features/settings/settingsActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectAddressIds } from '~/store/addressesSlice'
import { resetNavigation } from '~/utils/navigation'

interface AddBiometricsScreenProps extends StackScreenProps<RootStackParamList, 'AddBiometricsScreen'>, ScreenProps {}

const instructions: Instruction[] = [
  { text: `${i18n.t('Do you want to activate biometric security?')} 👆`, type: 'primary' },
  { text: i18n.t('Use fingerprint or face recognition instead of the pin to unlock the wallet'), type: 'secondary' }
]

const AddBiometricsScreen = ({ navigation, ...props }: AddBiometricsScreenProps) => {
  const method = useAppSelector((s) => s.walletGeneration.method)
  const dispatch = useAppDispatch()
  const addressIds = useAppSelector(selectAddressIds)
  const { t } = useTranslation()

  const skipAddressDiscovery = method === 'create' || addressIds.length > 1

  const openBiometricsWarningModal = () =>
    dispatch(
      openModal({ name: 'BiometricsWarningModal', props: { onConfirm: handleLaterPress, confirmText: t('Skip') } })
    )

  const activateBiometrics = () => {
    dispatch(allBiometricsEnabled())

    sendAnalytics({ event: 'Activated biometrics from wallet creation flow' })

    resetNavigation(navigation, skipAddressDiscovery ? 'NewWalletSuccessScreen' : 'ImportWalletAddressDiscoveryScreen')
  }

  const handleLaterPress = () => {
    sendAnalytics({ event: 'Skipped biometrics activation from wallet creation flow' })

    resetNavigation(
      navigation,
      method === 'import' && !skipAddressDiscovery ? 'ImportWalletAddressDiscoveryScreen' : 'NewWalletSuccessScreen'
    )
  }

  return (
    <ScrollScreen fill headerOptions={{ type: 'stack' }} {...props}>
      <AnimationContainer>
        <WhiteCircle>
          <StyledAnimation source={animationSrc} autoPlay speed={1.5} />
        </WhiteCircle>
      </AnimationContainer>
      <CenteredInstructions instructions={instructions} stretch />
      <BottomButtons>
        <Button title={t('Activate')} type="primary" variant="highlight" onPress={activateBiometrics} />
        <Button title={t('Later')} type="secondary" onPress={openBiometricsWarningModal} />
      </BottomButtons>
    </ScrollScreen>
  )
}

export default AddBiometricsScreen

const AnimationContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const StyledAnimation = styled(LottieView)`
  width: 300px;
  height: 120%;
  margin-left: 0.5px;
`

const WhiteCircle = styled.View`
  background-color: white;
  width: 150px;
  height: 150px;
  border-radius: 150px;
  align-items: center;
  justify-content: center;
`
