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
import styled from 'styled-components/native'

import animationSrc from '../../animations/wallet.json'
import Button from '../../components/buttons/Button'
import ButtonStack from '../../components/buttons/ButtonStack'
import Screen from '../../components/layout/Screen'
import CenteredInstructions, { Instruction } from '../../components/text/CenteredInstructions'
import { useAppSelector } from '../../hooks/redux'
import RootStackParamList from '../../navigation/rootStackRoutes'

type ScreenProps = StackScreenProps<RootStackParamList, 'NewWalletNameScreen'>

const instructionsCreate: Instruction[] = [
  { text: 'You are about to create a wallet 🎉', type: 'primary' },
  { text: 'Your gateway to the Alephium ecosystem', type: 'secondary' },
  { text: 'More info', type: 'link', url: 'https://wiki.alephium.org/Frequently-Asked-Questions.html' }
]
const instructionsImport: Instruction[] = [
  { text: 'You are about to import a wallet 🎉', type: 'primary' },
  { text: 'Get your secret phrase ready!', type: 'secondary' },
  { text: 'More info', type: 'link', url: 'https://wiki.alephium.org/Frequently-Asked-Questions.html' }
]

const instructions = {
  create: instructionsCreate,
  import: instructionsImport
}

const NewWalletIntroScreen = ({ navigation }: ScreenProps) => {
  const method = useAppSelector((state) => state.walletGeneration.method) || 'create'

  console.log('NewWalletIntroScreen renders')
  return (
    <Screen>
      <AnimationContainer>
        <StyledAnimation source={animationSrc} autoPlay />
      </AnimationContainer>
      <CenteredInstructions instructions={instructions[method]} stretch />
      <ActionsContainer>
        <ButtonStack>
          <Button title="Let's go!" type="primary" onPress={() => navigation.navigate('NewWalletNameScreen')} />
          <Button title="Cancel" type="secondary" onPress={() => navigation.goBack()} />
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
  width: 40%;
`

const ActionsContainer = styled.View`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`

export default NewWalletIntroScreen
