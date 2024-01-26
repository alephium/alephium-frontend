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
import { useState } from 'react'
import styled from 'styled-components/native'

import { ContinueButton } from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenProps } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import { useAppDispatch } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { newWalletNameEntered } from '~/store/walletGenerationSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

const instructions: Instruction[] = [
  { text: "Alright, let's get to it.", type: 'secondary' },
  { text: 'How should we call this wallet?', type: 'primary' }
]

interface NewWalletNameScreenProps extends StackScreenProps<RootStackParamList, 'NewWalletNameScreen'>, ScreenProps {}

const NewWalletNameScreen = ({ navigation, ...props }: NewWalletNameScreenProps) => {
  const dispatch = useAppDispatch()

  const [name, setName] = useState('')

  const handleButtonPress = async () => {
    if (!name) return

    dispatch(newWalletNameEntered(name))

    navigation.navigate('PinCodeCreationScreen')
  }

  return (
    <ScrollScreen
      usesKeyboard
      fill
      headerOptions={{
        type: 'stack',
        headerRight: () => <ContinueButton onPress={handleButtonPress} disabled={name.length < 3} />
      }}
      keyboardShouldPersistTaps="always"
      {...props}
    >
      <ContentContainer>
        <CenteredInstructions instructions={instructions} />
        <StyledInput
          label="Wallet name"
          value={name}
          onChangeText={setName}
          autoFocus
          onSubmitEditing={handleButtonPress}
          blurOnSubmit={false}
          returnKeyType="done"
          maxLength={24}
        />
      </ContentContainer>
    </ScrollScreen>
  )
}

export default NewWalletNameScreen

const ContentContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  margin-bottom: 75%;
`

const StyledInput = styled(Input)`
  margin-top: ${DEFAULT_MARGIN}px;
  width: 80%;
`
