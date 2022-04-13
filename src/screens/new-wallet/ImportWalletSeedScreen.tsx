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
import { Text } from 'react-native'
import styled from 'styled-components/native'

import Button from '../../components/buttons/Button'
import Input from '../../components/inputs/Input'
import Screen from '../../components/layout/Screen'
import { useGlobalContext } from '../../contexts/global'
import { useWalletGenerationContext } from '../../contexts/walletGeneration'
import RootStackParamList from '../../navigation/rootStackRoutes'
import { createAndStoreWallet } from '../../utils/wallet'

type ScreenProps = StackScreenProps<RootStackParamList, 'NewWalletNameScreen'>

const ImportWalletSeedScreen = ({ navigation }: ScreenProps) => {
  const [secretPhrase, setSecretPhrase] = useState('')
  const [words, setWords] = useState<string[]>([])
  const { name, pin } = useWalletGenerationContext()
  const { setWallet } = useGlobalContext()

  useEffect(() => {
    setWords(
      secretPhrase
        .trim()
        .split(' ')
        .filter((word) => word.length > 3)
    )
  }, [secretPhrase])

  const handleWalletImport = () => {
    if (!isNextButtonActive || !pin || !name) return

    const createWalletAndNavigate = async () => {
      const wallet = await createAndStoreWallet(name, pin, words.join(' '))
      setWallet(wallet)

      navigation.navigate('DashboardScreen')
    }

    createWalletAndNavigate()
  }

  // Alephium's node code uses 12 as the minimal mnemomic length.
  const isNextButtonActive = words.length >= 12

  return (
    <Screen>
      <InstructionsContainer>
        <InstructionsFirstLine>Enter your secret phrase.</InstructionsFirstLine>
        {words.length > 0 && (
          <InstructionsSecondLine>
            {words.length} {words.length === 1 ? 'word' : 'words'} entered.
          </InstructionsSecondLine>
        )}
      </InstructionsContainer>
      <InputContainer>
        <StyledInput multiline label="Secret phrase" value={secretPhrase} onChangeText={setSecretPhrase} autoFocus />
      </InputContainer>
      <ActionsContainer>
        <Button title="Import wallet" type="primary" wide disabled={!isNextButtonActive} onPress={handleWalletImport} />
      </ActionsContainer>
    </Screen>
  )
}

const InstructionsContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const InstructionsFirstLine = styled(Text)`
  font-size: 16px;
  color: ${({ theme }) => theme.font.secondary};
  margin-bottom: 10px;
`

const InstructionsSecondLine = styled(Text)`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.font.primary};
`

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
