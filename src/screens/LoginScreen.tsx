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

import { walletOpen } from '@alephium/sdk'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useState } from 'react'

import PinCodeInput from '../components/inputs/PinCodeInput'
import Screen from '../components/layout/Screen'
import CenteredInstructions, { Instruction } from '../components/text/CenteredInstructions'
import { useAppDispatch } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { walletChanged } from '../store/activeWalletSlice'
import { pinEntered } from '../store/credentialsSlice'

type ScreenProps = StackScreenProps<RootStackParamList, 'LoginScreen'>

const pinLength = 6

const firstInstructionSet: Instruction[] = [
  { text: 'Please enter your pin', type: 'primary' },
  { text: 'More info', type: 'link', url: 'https://wiki.alephium.org/Frequently-Asked-Questions.html' }
]

const errorInstructionSet: Instruction[] = [
  { text: 'Oops, wrong pin!', type: 'error' },
  { text: 'Please try again 💪', type: 'secondary' }
]

const LoginScreen = ({ navigation, route }: ScreenProps) => {
  const [pinCode, setPinCode] = useState('')
  const [shownInstructions, setShownInstructions] = useState(firstInstructionSet)
  const dispatch = useAppDispatch()
  const activeEncryptedWallet = route.params.activeWallet

  useFocusEffect(
    useCallback(() => {
      setShownInstructions(firstInstructionSet)
      setPinCode('')
    }, [])
  )

  useEffect(() => {
    if (pinCode.length !== pinLength) return

    try {
      const wallet = walletOpen(pinCode, activeEncryptedWallet.mnemonic)
      dispatch(pinEntered(pinCode))
      dispatch(
        walletChanged({
          name: activeEncryptedWallet.name,
          mnemonic: wallet.mnemonic,
          authType: activeEncryptedWallet.authType
        })
      )
      setPinCode('')
      navigation.navigate('DashboardScreen')
    } catch (e) {
      setShownInstructions(errorInstructionSet)
      setPinCode('')
      console.error(`Could not unlock wallet ${activeEncryptedWallet.name}`, e)
    }
  }, [activeEncryptedWallet, dispatch, navigation, pinCode])

  console.log('LoginScreen renders')

  return (
    <Screen>
      <CenteredInstructions instructions={shownInstructions} />
      <PinCodeInput pinLenght={pinLength} value={pinCode} onPinChange={setPinCode} />
    </Screen>
  )
}

export default LoginScreen
