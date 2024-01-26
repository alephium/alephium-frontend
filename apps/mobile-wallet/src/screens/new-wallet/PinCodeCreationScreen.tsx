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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useState } from 'react'

import { sendAnalytics } from '~/analytics'
import PinCodeInput from '~/components/inputs/PinCodeInput'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import SpinnerModal from '~/components/SpinnerModal'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import useBiometrics from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { generateAndStoreWallet } from '~/persistent-storage/wallet'
import { syncAddressesData, syncAddressesHistoricBalances } from '~/store/addressesSlice'
import { newPinVerified } from '~/store/credentialsSlice'
import { newWalletGenerated } from '~/store/wallet/walletActions'
import { ShouldClearPin } from '~/types/misc'
import { resetNavigation } from '~/utils/navigation'

interface PinCodeCreationScreenProps
  extends StackScreenProps<RootStackParamList, 'PinCodeCreationScreen'>,
    ScreenProps {}

type Step = 'enter-pin' | 'verify-pin'

const pinLength = 6

const firstInstructionSet: Instruction[] = [
  { text: 'Please choose a pin 🔐', type: 'primary' },
  { text: 'Try not to forget it!', type: 'secondary' }
]

const secondInstructionSet: Instruction[] = [
  { text: 'Please type your code again', type: 'primary' },
  { text: 'Making sure you got it right 😇', type: 'secondary' }
]

const errorInstructionSet: Instruction[] = [
  { text: 'Oops, not the same code!', type: 'error' },
  { text: 'Please try again 💪', type: 'secondary' }
]

const PinCodeCreationScreen = ({ navigation, style, ...props }: PinCodeCreationScreenProps) => {
  const dispatch = useAppDispatch()
  const deviceHasBiometricsData = useBiometrics()
  const { method, walletName: name } = useAppSelector((s) => s.walletGeneration)

  const [chosenPinCode, setChosenPinCode] = useState('')
  const [shownInstructions, setShownInstructions] = useState(firstInstructionSet)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<Step>('enter-pin')

  useFocusEffect(
    useCallback(() => {
      setStep('enter-pin')
      setShownInstructions(firstInstructionSet)
    }, [])
  )

  const handlePinCodeSet = (pin: string): ShouldClearPin => {
    setChosenPinCode(pin)
    setShownInstructions(secondInstructionSet)
    setStep('verify-pin')

    return true
  }

  const handlePinCodeVerification = async (pin: string): Promise<ShouldClearPin> => {
    if (pin !== chosenPinCode) {
      setShownInstructions(errorInstructionSet)
      return true
    }

    dispatch(newPinVerified(pin))

    if (method === 'import') {
      navigation.navigate('SelectImportMethodScreen')
      return true
    }

    if (method === 'create') {
      setLoading(true)

      const wallet = await generateAndStoreWallet(name, pin)
      dispatch(newWalletGenerated(wallet))
      dispatch(syncAddressesData(wallet.firstAddress.hash))
      dispatch(syncAddressesHistoricBalances(wallet.firstAddress.hash))

      sendAnalytics('Created new wallet')

      setLoading(false)

      resetNavigation(navigation, deviceHasBiometricsData ? 'AddBiometricsScreen' : 'NewWalletSuccessScreen')
    }

    return true
  }

  const handleFullPinEntered = (pin: string) =>
    step === 'enter-pin' ? handlePinCodeSet(pin) : step === 'verify-pin' ? handlePinCodeVerification(pin) : false

  return (
    <Screen headerOptions={{ type: 'stack' }} contrastedBg {...props}>
      <CenteredInstructions instructions={shownInstructions} />
      <PinCodeInput pinLength={pinLength} onPinEntered={handleFullPinEntered} />
      <SpinnerModal isActive={loading} text="Creating wallet..." />
    </Screen>
  )
}

export default PinCodeCreationScreen
