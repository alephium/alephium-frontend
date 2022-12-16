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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useState } from 'react'

import PinCodeInput from '../../components/inputs/PinCodeInput'
import Screen from '../../components/layout/Screen'
import SpinnerModal from '../../components/SpinnerModal'
import CenteredInstructions, { Instruction } from '../../components/text/CenteredInstructions'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import useBiometrics from '../../hooks/useBiometrics'
import RootStackParamList from '../../navigation/rootStackRoutes'
import { generateAndStoreWallet } from '../../persistent-storage/wallets'
import { newWalletGenerated } from '../../store/activeWalletSlice'
import { fetchAddressesData } from '../../store/addressesSlice'
import { newPinVerified } from '../../store/credentialsSlice'

type ScreenProps = StackScreenProps<RootStackParamList, 'PinCodeCreationScreen'>

type Step = 'enter-pin' | 'verify-pin'

const pinLength = 6

const firstInstructionSet: Instruction[] = [
  { text: 'Please choose a pin 🔐', type: 'primary' },
  { text: 'Try not to forget it!', type: 'secondary' },
  { text: 'More info', type: 'link', url: 'https://docs.alephium.org/Frequently-Asked-Questions.html' }
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
  const dispatch = useAppDispatch()
  const hasAvailableBiometrics = useBiometrics()
  const [pinCode, setPinCode] = useState('')
  const [chosenPinCode, setChosenPinCode] = useState('')
  const [shownInstructions, setShownInstructions] = useState(firstInstructionSet)
  const { method, walletName: name } = useAppSelector((state) => state.walletGeneration)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<Step>('enter-pin')

  const isPinCodeFullyEntered = pinCode.length === pinLength

  useFocusEffect(
    useCallback(() => {
      setStep('enter-pin')
      setShownInstructions(firstInstructionSet)
      setPinCode('')
    }, [])
  )

  const handlePinCodeSet = useCallback(() => {
    setChosenPinCode(pinCode)
    setShownInstructions(secondInstructionSet)
    setPinCode('')
    setStep('verify-pin')
  }, [pinCode])

  const handlePinCodeVerification = useCallback(async () => {
    if (pinCode !== chosenPinCode) {
      setPinCode('')
      setShownInstructions(errorInstructionSet)
      return
    }

    dispatch(newPinVerified(pinCode))

    if (method === 'import') {
      navigation.navigate('ImportWalletSeedScreen')
      return
    }

    if (method === 'create') {
      setLoading(true)

      const wallet = await generateAndStoreWallet(name, pinCode)
      dispatch(newWalletGenerated(wallet))
      dispatch(fetchAddressesData([wallet.firstAddress.hash]))

      setLoading(false)

      navigation.navigate(hasAvailableBiometrics ? 'AddBiometricsScreen' : 'NewWalletSuccessPage')
    }

    setPinCode('')
  }, [chosenPinCode, dispatch, hasAvailableBiometrics, method, name, navigation, pinCode])

  useEffect(() => {
    if (!isPinCodeFullyEntered) {
      return
    } else if (step === 'enter-pin') {
      handlePinCodeSet()
    } else if (step === 'verify-pin') {
      handlePinCodeVerification()
    }
  }, [handlePinCodeSet, handlePinCodeVerification, isPinCodeFullyEntered, step])

  return (
    <Screen>
      <CenteredInstructions instructions={shownInstructions} />
      <PinCodeInput pinLength={pinLength} value={pinCode} onPinChange={setPinCode} />
      <SpinnerModal isActive={loading} text="Creating wallet..." />
    </Screen>
  )
}

export default PinCodeCreationScreen
