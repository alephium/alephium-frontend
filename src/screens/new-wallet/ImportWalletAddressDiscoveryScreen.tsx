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
import styled from 'styled-components/native'

import animationSrc from '~/animations/wallet.json'
import Button from '~/components/buttons/Button'
import ButtonStack from '~/components/buttons/ButtonStack'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface ImportWalletAddressDiscoveryScreenProps
  extends StackScreenProps<RootStackParamList, 'ImportWalletAddressDiscoveryScreen'>,
    ScreenProps {}

const instructions: Instruction[] = [
  { text: "Let's take a minute to scan for your active addresses", type: 'primary' },
  {
    text: 'Scan the blockchain to find addresses that you used in the past. This should take less than a minute.',
    type: 'secondary'
  }
]

const ImportWalletAddressDiscoveryScreen = ({ navigation, ...props }: ImportWalletAddressDiscoveryScreenProps) => {
  const posthog = usePostHog()

  const handleLaterPress = () => {
    posthog?.capture('Skipped address discovery')

    navigation.navigate('NewWalletSuccessScreen')
  }

  return (
    <Screen {...props}>
      <AnimationContainer>
        <StyledAnimation source={animationSrc} autoPlay speed={1.5} />
      </AnimationContainer>
      <CenteredInstructions instructions={instructions} stretch />
      <ActionsContainer>
        <ButtonStack>
          <Button
            title="Scan"
            type="primary"
            onPress={() => navigation.navigate('AddressDiscoveryScreen', { isImporting: true })}
          />
          <Button title="Later" type="secondary" onPress={handleLaterPress} />
        </ButtonStack>
      </ActionsContainer>
    </Screen>
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
`

const ActionsContainer = styled.View`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`
