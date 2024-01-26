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

import animationSrc from '~/animations/lottie/wallet.json'
import Button from '~/components/buttons/Button'
import ButtonStack from '~/components/buttons/ButtonStack'
import { ScreenProps } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface NewWalletIntroScreenProps extends StackScreenProps<RootStackParamList, 'NewWalletIntroScreen'>, ScreenProps {}

const instructionsCreate: Instruction[] = [
  { text: 'You are about to create a wallet 🎉', type: 'primary' },
  { text: 'Your gateway to the Alephium ecosystem', type: 'secondary' }
]
const instructionsImport: Instruction[] = [
  { text: 'You are about to import a wallet 🎉', type: 'primary' },
  { text: 'Get your secret phrase ready!', type: 'secondary' }
]

const instructions = {
  create: instructionsCreate,
  import: instructionsImport
}

const NewWalletIntroScreen = ({ navigation, ...props }: NewWalletIntroScreenProps) => {
  const method = useAppSelector((s) => s.walletGeneration.method) || 'create'

  return (
    <ScrollScreen fill headerOptions={{ type: 'stack' }} {...props}>
      <AnimationContainer>
        <StyledAnimation source={animationSrc} autoPlay />
      </AnimationContainer>
      <CenteredInstructions instructions={instructions[method]} />
      <ActionsContainer>
        <ButtonStack>
          <Button
            title="Let's go!"
            type="primary"
            variant="highlight"
            onPress={() => navigation.navigate('NewWalletNameScreen')}
          />
          <Button title="Cancel" type="secondary" onPress={() => navigation.goBack()} />
        </ButtonStack>
      </ActionsContainer>
    </ScrollScreen>
  )
}

export default NewWalletIntroScreen

const AnimationContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const StyledAnimation = styled(LottieView)`
  width: 40%;
`

const ActionsContainer = styled.View`
  flex: 2;
  justify-content: flex-end;
  align-items: center;
`
