/*
Copyright 2018 - 2024 The Alephium Authors
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
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import animationSrc from '~/animations/lottie/wallet.json'
import Button from '~/components/buttons/Button'
import ButtonStack from '~/components/buttons/ButtonStack'
import { ScreenProps } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
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
  const handleLaterPress = () => {
    sendAnalytics('Skipped address discovery')

    navigation.navigate('NewWalletSuccessScreen')
  }

  return (
    <ScrollScreen fill headerOptions={{ headerTitle: 'Active addresses', type: 'stack' }} {...props}>
      <AnimationContainer>
        <StyledAnimation source={animationSrc} autoPlay speed={1.5} />
      </AnimationContainer>
      <CenteredInstructions instructions={instructions} stretch />
      <ActionsContainer>
        <ButtonStack>
          <Button
            title="Scan"
            type="primary"
            variant="highlight"
            onPress={() => navigation.navigate('AddressDiscoveryScreen', { isImporting: true })}
          />
          <Button title="Later" type="primary" variant="accent" onPress={handleLaterPress} />
        </ButtonStack>
      </ActionsContainer>
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
`

const ActionsContainer = styled.View`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`
