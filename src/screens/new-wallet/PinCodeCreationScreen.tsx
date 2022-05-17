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
import { isEnrolledAsync } from 'expo-local-authentication'
import { useCallback, useEffect, useState } from 'react'

import PinCodeInput from '../../components/inputs/PinCodeInput'
import Screen from '../../components/layout/Screen'
import CenteredInstructions, { Instruction } from '../../components/text/CenteredInstructions'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import RootStackParamList from '../../navigation/rootStackRoutes'
import { walletStored } from '../../store/activeWalletSlice'
import { pinEntered } from '../../store/credentialsSlice'

type ScreenProps = StackScreenProps<RootStackParamList, 'PinCodeCreationScreen'>

const pinLength = 6

const firstInstructionSet: Instruction[] = [
  { text: 'Please choose a passcode 🔐', type: 'primary' },
  { text: 'Try not to forget it!', type: 'secondary' },
  { text: 'More info', type: 'link', url: 'https://wiki.alephium.org/Frequently-Asked-Questions.html' }
]

const secondInstructionSet: Instruction[] = [
  { text: 'Please type your code again', type: 'primary' },
  { text: 'Making sure you got it right 😇', type: 'secondary' }
]

const errorInstructionSet: Instruction[] = [
  { text: 'Oops, not the same code!', type: 'error' },
  { text: 'Please try again 💪', type: 'secondary' }
]

const PinCodeCreationScreen = ({ navigation }: ScreenProps) => {
  const [hasAvailableBiometrics, setHasAvailableBiometrics] = useState<boolean>()
  const method = useAppSelector((state) => state.walletGeneration.method)
  const [pinCode, setPinCode] = useState('')
  const [chosenPinCode, setChosenPinCode] = useState('')
  const [shownInstructions, setShownInstructions] = useState(firstInstructionSet)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const dispatch = useAppDispatch()

  useFocusEffect(
    useCallback(() => {
      setIsVerifyingCode(false)
      setShownInstructions(firstInstructionSet)
      setPinCode('')
    }, [])
  )

  useEffect(() => {
    const checkBiometricsAvailability = async () => {
      const available = await isEnrolledAsync()
      setHasAvailableBiometrics(available)
    }

    checkBiometricsAvailability()
  }, [])

  useEffect(() => {
    // Switch to pin code check
    if (pinCode.length !== pinLength) return

    const handlePinCodeSet = () => {
      setIsVerifyingCode(true)
      setChosenPinCode(pinCode)
      setShownInstructions(secondInstructionSet)
      setPinCode('')
    }

    const handlePinCodeVerification = async () => {
      if (pinCode === chosenPinCode) {
        dispatch(pinEntered(pinCode))
        setPinCode('')

        if (method === 'create') {
          const wallet = walletGenerate()
          dispatch(walletStored(wallet.mnemonic))
        }

        if (hasAvailableBiometrics !== undefined && hasAvailableBiometrics) {
          navigation.navigate('AddBiometricsScreen')
        } else {
          // TODO: Navigate to following screen
        }
      } else {
        setPinCode('')
        setShownInstructions(errorInstructionSet)
      }
    }

    !isVerifyingCode ? handlePinCodeSet() : handlePinCodeVerification()
  }, [chosenPinCode, dispatch, hasAvailableBiometrics, isVerifyingCode, method, navigation, pinCode])

  console.log('PinCodeCreationScreen renders')

  return (
    <Screen>
      <CenteredInstructions instructions={shownInstructions} />
      <PinCodeInput pinLenght={pinLength} value={pinCode} onPinChange={setPinCode} />
    </Screen>
  )
}

export default PinCodeCreationScreen
