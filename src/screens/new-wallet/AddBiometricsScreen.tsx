/*
Copyright 2018 - 2022 The Alephium Authors
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

import { StackScreenProps } from '@react-navigation/stack'
import LottieView from 'lottie-react-native'
import { usePostHog } from 'posthog-react-native'
import { useState } from 'react'
import styled from 'styled-components/native'

import animationSrc from '~/animations/lottie/fingerprint.json'
import Button from '~/components/buttons/Button'
import ButtonStack from '~/components/buttons/ButtonStack'
import { ScreenProps } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { enableBiometrics } from '~/persistent-storage/wallet'
import { selectAddressIds } from '~/store/addressesSlice'
import { biometricsToggled } from '~/store/settingsSlice'
import { resetNavigationState } from '~/utils/navigation'

interface AddBiometricsScreenProps extends StackScreenProps<RootStackParamList, 'AddBiometricsScreen'>, ScreenProps {}

const instructions: Instruction[] = [
  { text: 'Do you want to activate biometric security? 👆', type: 'primary' },
  { text: 'Use fingerprint or face recognition instead of the pin to unlock the wallet', type: 'secondary' }
]

const AddBiometricsScreen = ({ navigation, route: { params }, ...props }: AddBiometricsScreenProps) => {
  const method = useAppSelector((s) => s.walletGeneration.method)
  const dispatch = useAppDispatch()
  const walletMnemonic = useAppSelector((s) => s.wallet.mnemonic)
  const addressIds = useAppSelector(selectAddressIds)
  const posthog = usePostHog()

  const [loading, setLoading] = useState(false)

  const skipAddressDiscovery = method === 'create' || addressIds.length > 1

  const activateBiometrics = async () => {
    setLoading(true)

    try {
      await enableBiometrics(walletMnemonic)
      dispatch(biometricsToggled(true))

      posthog?.capture('Activated biometrics from wallet creation flow')

      resetNavigationState(skipAddressDiscovery ? 'NewWalletSuccessScreen' : 'ImportWalletAddressDiscoveryScreen')
    } finally {
      setLoading(false)
    }
  }

  const handleLaterPress = () => {
    posthog?.capture('Skipped biometrics activation from wallet creation flow')

    resetNavigationState(
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
      <ActionsContainer>
        <ButtonStack>
          <Button title="Activate" type="primary" variant="highlight" onPress={activateBiometrics} />
          <Button title="Later" type="secondary" onPress={handleLaterPress} />
        </ButtonStack>
      </ActionsContainer>
      <SpinnerModal isActive={loading} text="Enabling biometrics..." />
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
  margin-left: 0.5px; // Fixes tiny misalignment
`

const ActionsContainer = styled.View`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`

const WhiteCircle = styled.View`
  background-color: white;
  width: 150px;
  height: 150px;
  border-radius: 150px;
  align-items: center;
  justify-content: center;
`
