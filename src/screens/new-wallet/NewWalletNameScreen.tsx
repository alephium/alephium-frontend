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
import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components/native'

import Button from '../../components/buttons/Button'
import ConfirmWithAuthModal from '../../components/ConfirmWithAuthModal'
import Input from '../../components/inputs/Input'
import Screen from '../../components/layout/Screen'
import SpinnerModal from '../../components/SpinnerModal'
import CenteredInstructions, { Instruction } from '../../components/text/CenteredInstructions'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import useBiometrics from '../../hooks/useBiometrics'
import RootStackParamList from '../../navigation/rootStackRoutes'
import { enableBiometrics, generateAndStoreWallet } from '../../persistent-storage/wallets'
import { biometricsEnabled, newWalletGenerated } from '../../store/activeWalletSlice'
import { syncAddressesData } from '../../store/addressesSlice'
import { newWalletNameEntered } from '../../store/walletGenerationSlice'

const instructions: Instruction[] = [
  { text: "Alright, let's get to it.", type: 'secondary' },
  { text: 'How should we call this wallet?', type: 'primary' }
]

type ScreenProps = StackScreenProps<RootStackParamList, 'NewWalletNameScreen'>

const NewWalletNameScreen = ({ navigation }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const [name, setName] = useState('')
  const [method, activeWallet, pin] = useAppSelector((s) => [
    s.walletGeneration.method,
    s.activeWallet,
    s.credentials.pin
  ])
  const [loading, setLoading] = useState(false)
  const hasAvailableBiometrics = useBiometrics()
  const [isPinModalVisible, setIsPinModalVisible] = useState(false)
  const lastActiveWallet = useRef(activeWallet)

  const isAuthenticated = !!activeWallet.mnemonic

  const createNewWallet = useCallback(
    async (pin?: string) => {
      if (!pin) {
        setIsPinModalVisible(true)
        return
      }

      setLoading(true)

      const wallet = await generateAndStoreWallet(name, pin)
      dispatch(newWalletGenerated(wallet))
      dispatch(syncAddressesData([wallet.firstAddress.hash]))

      // We assume the preference of the user to enable biometrics by looking at the auth settings of the current wallet
      if (lastActiveWallet.current.authType === 'biometrics' && hasAvailableBiometrics) {
        await enableBiometrics(wallet.metadataId, wallet.mnemonic)
        dispatch(biometricsEnabled())
      }

      setLoading(false)

      navigation.navigate('NewWalletSuccessPage')
    },
    [dispatch, hasAvailableBiometrics, name, navigation]
  )

  const handleButtonPress = async () => {
    if (!name) return

    dispatch(newWalletNameEntered(name))

    if (!isAuthenticated) {
      navigation.navigate('PinCodeCreationScreen')
      return
    }

    if (method === 'import') {
      navigation.navigate('ImportWalletSeedScreen')
      return
    }

    if (method === 'create') {
      createNewWallet(pin)
    }
  }

  return (
    <Screen>
      <CenteredInstructions instructions={instructions} stretch />
      <InputContainer>
        <StyledInput label="Wallet name" value={name} onChangeText={setName} autoFocus isTopRounded isBottomRounded />
      </InputContainer>
      <ActionsContainer>
        <Button title="Next" type="primary" wide disabled={name.length < 3} onPress={handleButtonPress} />
      </ActionsContainer>
      {isPinModalVisible && <ConfirmWithAuthModal usePin onConfirm={createNewWallet} />}
      <SpinnerModal isActive={loading} text="Creating wallet..." />
    </Screen>
  )
}

export default NewWalletNameScreen

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
