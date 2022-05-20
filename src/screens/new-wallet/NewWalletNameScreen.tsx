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

import { walletGenerate } from '@alephium/sdk'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components/native'

import Button from '../../components/buttons/Button'
import Input from '../../components/inputs/Input'
import Screen from '../../components/layout/Screen'
import CenteredInstructions, { Instruction } from '../../components/text/CenteredInstructions'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import RootStackParamList from '../../navigation/rootStackRoutes'
import { walletNameChanged, walletStored } from '../../store/activeWalletSlice'

const instructions: Instruction[] = [
  { text: "Alright, let's get to it.", type: 'secondary' },
  { text: 'How should we call this wallet?', type: 'primary' }
]

type ScreenProps = StackScreenProps<RootStackParamList, 'NewWalletNameScreen'>

const NewWalletNameScreen = ({ navigation }: ScreenProps) => {
  const [walletName, setWalletName] = useState('')
  const dispatch = useAppDispatch()
  const pin = useAppSelector((state) => state.credentials.pin)
  const method = useAppSelector((state) => state.walletGeneration.method)
  const mnemonic = useAppSelector((state) => state.activeWallet.mnemonic)

  const handleButtonPress = async () => {
    if (walletName) {
      dispatch(walletNameChanged(walletName))

      if (!pin) {
        navigation.navigate('PinCodeCreationScreen')
      } else {
        if (method === 'create') {
          const wallet = walletGenerate()
          dispatch(walletStored(wallet.mnemonic))
        } else if (method === 'import') {
          navigation.navigate('ImportWalletSeedScreen')
        }
      }
    }
  }

  useFocusEffect(
    useCallback(() => {
      if (mnemonic) navigation.navigate('DashboardScreen')
    }, [mnemonic, navigation])
  )

  console.log('NewWalletNameScreen renders')

  return (
    <Screen>
      <CenteredInstructions instructions={instructions} stretch />
      <InputContainer>
        <StyledInput label="Wallet name" value={walletName} onChangeText={setWalletName} autoFocus />
      </InputContainer>
      <ActionsContainer>
        <Button title="Next" type="primary" wide disabled={walletName.length < 3} onPress={handleButtonPress} />
      </ActionsContainer>
    </Screen>
  )
}

const InputContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const StyledInput = styled(Input)`
  width: 80%;
`

const ActionsContainer = styled.View`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`

export default NewWalletNameScreen
