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
import { authenticateAsync } from 'expo-local-authentication'
import * as SecureStore from 'expo-secure-store'
import LottieView from 'lottie-react-native'
import styled from 'styled-components/native'

import animationSrc from '../../animations/fingerprint.json'
import Button from '../../components/buttons/Button'
import ButtonStack from '../../components/buttons/ButtonStack'
import Screen from '../../components/layout/Screen'
import CenteredInstructions, { Instruction } from '../../components/text/CenteredInstructions'
import RootStackParamList from '../../navigation/rootStackRoutes'

type ScreenProps = StackScreenProps<RootStackParamList, 'AddBiometricsScreen'>

const instructions: Instruction[] = [
  { text: 'Do you want to activate biometric security? 👆', type: 'primary' },
  { text: 'Use fingerprint or face recognition instead of the passcode to unlock the wallet', type: 'secondary' }
]

const AddBiometricsScreen = ({ navigation }: ScreenProps) => {
  const navigateToNextPage = () => navigation.navigate('NewWalletSuccessPage')

  const handleActivateBiometrics = async () => {
    const authResult = await authenticateAsync({
      promptMessage: 'Activate biometrics',
      disableDeviceFallback: true,
      cancelLabel: 'Cancel'
    })

    if (authResult.success) {
      SecureStore.setItemAsync('usingBiometrics', 'true')
      navigateToNextPage()
    }
  }

  return (
    <Screen>
      <AnimationContainer>
        <StyledAnimation source={animationSrc} autoPlay speed={1.5} />
      </AnimationContainer>
      <CenteredInstructions instructions={instructions} stretch />
      <ActionsContainer>
        <ButtonStack>
          <Button title="Activate" type="primary" onPress={handleActivateBiometrics} />
          <Button title="Later" type="secondary" onPress={navigateToNextPage} />
        </ButtonStack>
      </ActionsContainer>
    </Screen>
  )
}

const AnimationContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const StyledAnimation = styled(LottieView)`
  width: 60%;
`

const ActionsContainer = styled.View`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`

export default AddBiometricsScreen
