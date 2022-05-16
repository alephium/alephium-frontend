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
import { useEffect, useState } from 'react'
import styled from 'styled-components/native'

import Button from '../../components/buttons/Button'
import Input from '../../components/inputs/Input'
import Screen from '../../components/layout/Screen'
import CenteredInstructions, { Instruction } from '../../components/text/CenteredInstructions'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import RootStackParamList from '../../navigation/rootStackRoutes'
import { mnemonicChanged } from '../../store/activeWalletSlice'

type ScreenProps = StackScreenProps<RootStackParamList, 'NewWalletNameScreen'>

const ImportWalletSeedScreen = ({ navigation }: ScreenProps) => {
  const [secretPhrase, setSecretPhrase] = useState('')
  const [words, setWords] = useState<string[]>([])
  const pin = useAppSelector((state) => state.security.pin)
  const activeWalletName = useAppSelector((state) => state.activeWallet.name)
  const dispatch = useAppDispatch()

  useEffect(() => {
    setWords(
      secretPhrase
        .trim()
        .split(' ')
        .filter((word) => word.length > 2)
    )
  }, [secretPhrase])

  const handleWalletImport = () => {
    if (!pin || !activeWalletName) return

    dispatch(mnemonicChanged(words.join(' ')))
    navigation.navigate('NewWalletSuccessPage')
  }

  // Alephium's node code uses 12 as the minimal mnemomic length.
  const isNextButtonActive = words.length >= 12

  const instructions: Instruction[] = [{ text: 'Enter your secret phrase.', type: 'primary' }]

  if (words.length)
    instructions.push({ text: `${words.length} ${words.length === 1 ? 'word' : 'words'} entered.`, type: 'secondary' })

  console.log('ImportWalletSeedScreen renders')

  return (
    <Screen>
      <CenteredInstructions instructions={instructions} />
      <InputContainer>
        <StyledInput multiline label="Secret phrase" value={secretPhrase} onChangeText={setSecretPhrase} autoFocus />
      </InputContainer>
      <ActionsContainer>
        <Button title="Import wallet" type="primary" wide disabled={!isNextButtonActive} onPress={handleWalletImport} />
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

export default ImportWalletSeedScreen
