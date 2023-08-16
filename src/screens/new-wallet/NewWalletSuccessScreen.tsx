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
import styled, { useTheme } from 'styled-components/native'

import animationSrc from '~/animations/success.json'
import HighlightButton from '~/components/buttons/HighlightButton'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { resetNavigationState } from '~/utils/navigation'

interface NewWalletSuccessScreenProps
  extends StackScreenProps<RootStackParamList, 'NewWalletSuccessScreen'>,
    ScreenProps {}

const instructions: Instruction[] = [
  { text: 'Welcome to Alephium! 🎉', type: 'primary' },
  { text: 'Enjoy your new wallet!', type: 'secondary' }
]

const NewWalletSuccessScreenProps = ({ navigation, ...props }: NewWalletSuccessScreenProps) => {
  const theme = useTheme()

  return (
    <Screen {...props}>
      <AnimationContainer style={{ marginTop: 100 }}>
        <StyledAlephiumLogo color={theme.font.primary} />
        <StyledAnimation source={animationSrc} autoPlay />
      </AnimationContainer>
      <CenteredInstructions instructions={instructions} stretch fontSize={19} />
      <ActionsContainer>
        <HighlightButton title="Let's go!" wide onPress={() => resetNavigationState()} />
      </ActionsContainer>
    </Screen>
  )
}

export default NewWalletSuccessScreenProps

const AnimationContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const StyledAlephiumLogo = styled(AlephiumLogo)`
  position: absolute;
  width: 60%;
  height: 60%;
`

const StyledAnimation = styled(LottieView)`
  width: 80%;
`

const ActionsContainer = styled.View`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`
