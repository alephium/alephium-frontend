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
import { useEffect } from 'react'
import styled, { useTheme } from 'styled-components/native'

import animationSrc from '~/animations/lottie/success.json'
import HighlightButton from '~/components/buttons/HighlightButton'
import { ScreenProps, ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import { useAppSelector } from '~/hooks/redux'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { storeIsNewWallet } from '~/persistent-storage/wallet'
import { resetNavigation } from '~/utils/navigation'

interface NewWalletSuccessScreenProps
  extends StackScreenProps<RootStackParamList, 'NewWalletSuccessScreen'>,
    ScreenProps {}

const instructions: Instruction[] = [
  { text: 'Welcome to Alephium! 🎉', type: 'primary' },
  { text: 'Enjoy your new wallet!', type: 'secondary' }
]

const NewWalletSuccessScreen = ({ navigation, ...props }: NewWalletSuccessScreenProps) => {
  const method = useAppSelector((s) => s.walletGeneration.method)
  const theme = useTheme()

  useEffect(() => {
    storeIsNewWallet(method === 'create')
  }, [method])

  return (
    <ScrollScreen fill {...props}>
      <AnimationContainer style={{ marginTop: 100 }}>
        <StyledAlephiumLogo color={theme.font.primary} />
        <StyledAnimation source={animationSrc} autoPlay />
      </AnimationContainer>
      <CenteredInstructions instructions={instructions} stretch fontSize={19} />
      <ActionsContainer>
        <ScreenSection centered>
          <HighlightButton title="Let's go!" wide onPress={() => resetNavigation(navigation)} />
        </ScreenSection>
      </ActionsContainer>
    </ScrollScreen>
  )
}

export default NewWalletSuccessScreen

const AnimationContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const StyledAlephiumLogo = styled(AlephiumLogo)`
  position: absolute;
  width: 40%;
  height: 40%;
`

const StyledAnimation = styled(LottieView)`
  width: 80%;
`

const ActionsContainer = styled.View`
  flex: 1;
  justify-content: flex-end;
`
