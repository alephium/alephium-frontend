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
import { useCallback, useEffect, useMemo, useState } from 'react'

import PinCodeInput from '../../components/inputs/PinCodeInput'
import Screen from '../../components/layout/Screen'
import CenteredInstructions, { Instruction } from '../../components/text/CenteredInstructions'
import RootStackParamList from '../../navigation/rootStackRoutes'

type ScreenProps = StackScreenProps<RootStackParamList, 'PinCodeCreationScreen'>

const pinLength = 6

const PinCodeCreationScreen = ({ navigation }: ScreenProps) => {
  const firstInstructionSet: Instruction[] = useMemo(
    () => [
      { text: 'Please choose a passcode 🔐', type: 'primary' },
      { text: 'Try not to forget it!', type: 'secondary' },
      { text: 'More info', type: 'link', url: 'https://wiki.alephium.org/Frequently-Asked-Questions.html' }
    ],
    []
  )

  const secondInstructionSet: Instruction[] = useMemo(
    () => [
      { text: 'Please type your code again', type: 'primary' },
      { text: 'Making sure you got it right 😇', type: 'secondary' }
    ],
    []
  )

  const errorInstructionSet: Instruction[] = useMemo(
    () => [
      { text: 'Oops, not the same code!', type: 'error' },
      { text: 'Please try again 💪', type: 'secondary' }
    ],
    []
  )

  const [pinCode, setPinCode] = useState('')
  const [chosenPinCode, setChosenPinCode] = useState('')
  const [shownInstructions, setShownInstructions] = useState(firstInstructionSet)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)

  useFocusEffect(
    useCallback(() => {
      // Reset the pin code on screen enter
      setPinCode('')
      setIsVerifyingCode(false)
      setShownInstructions(firstInstructionSet)
    }, [firstInstructionSet])
  )

  useEffect(() => {
    // Switch to pin code check
    if (pinCode.length !== pinLength) return

    const handlePinCodeSet = () => {
      setIsVerifyingCode(true)
      setChosenPinCode(pinCode)
      setShownInstructions(secondInstructionSet)
      setPinCode('')
    }

    const handlePinCodeVerification = () => {
      if (pinCode === chosenPinCode) {
        navigation.navigate('AddBiometricsScreen')
      } else {
        setPinCode('')
        setShownInstructions(errorInstructionSet)
      }
    }

    !isVerifyingCode ? handlePinCodeSet() : handlePinCodeVerification()
  }, [chosenPinCode, errorInstructionSet, isVerifyingCode, navigation, pinCode, secondInstructionSet])

  return (
    <Screen>
      <CenteredInstructions instructions={shownInstructions} />
      <PinCodeInput pinLenght={pinLength} value={pinCode} onPinChange={setPinCode} />
    </Screen>
  )
}

export default PinCodeCreationScreen
