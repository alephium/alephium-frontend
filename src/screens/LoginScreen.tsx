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

import { walletOpenAsyncUnsafe } from '@alephium/sdk'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useState } from 'react'

import PinCodeInput from '../components/inputs/PinCodeInput'
import Screen from '../components/layout/Screen'
import SpinnerModal from '../components/SpinnerModal'
import CenteredInstructions, { Instruction } from '../components/text/CenteredInstructions'
import { useAppDispatch } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { activeWalletChanged } from '../store/activeWalletSlice'
import { pinEntered } from '../store/credentialsSlice'
import { mnemonicToSeed, pbkdf2 } from '../utils/crypto'
import { useRestoreNavigationState } from '../utils/navigation'

type ScreenProps = StackScreenProps<RootStackParamList, 'LoginScreen'>

export const pinLength = 6

const firstInstructionSet: Instruction[] = [
  { text: 'Please enter your pin', type: 'primary' },
  { text: 'More info', type: 'link', url: 'https://wiki.alephium.org/Frequently-Asked-Questions.html' }
]

export const errorInstructionSet: Instruction[] = [
  { text: 'Oops, wrong pin!', type: 'error' },
  { text: 'Please try again 💪', type: 'secondary' }
]

const LoginScreen = ({
  navigation,
  route: {
    params: { storedWallet, navigateToDashboard }
  }
}: ScreenProps) => {
  const dispatch = useAppDispatch()
  const [pinCode, setPinCode] = useState('')
  const [shownInstructions, setShownInstructions] = useState(firstInstructionSet)
  const pinFullyEntered = pinCode.length === pinLength
  const [loading, setLoading] = useState(false)
  const restoreNavigationState = useRestoreNavigationState()

  useFocusEffect(
    useCallback(() => {
      setShownInstructions(firstInstructionSet)
      setPinCode('')
    }, [])
  )

  const unlockWallet = useCallback(async () => {
    const wallet = await walletOpenAsyncUnsafe(pinCode, storedWallet.mnemonic, pbkdf2, mnemonicToSeed)
    await dispatch(
      activeWalletChanged({
        ...storedWallet,
        mnemonic: wallet.mnemonic
      })
    )
    restoreNavigationState(navigateToDashboard)
    setPinCode('')
  }, [dispatch, navigateToDashboard, pinCode, restoreNavigationState, storedWallet])

  useEffect(() => {
    if (!pinFullyEntered) return

    setLoading(true)

    try {
      dispatch(pinEntered(pinCode))
      unlockWallet()
    } catch (e) {
      setShownInstructions(errorInstructionSet)
      setPinCode('')
      console.error(`Could not unlock wallet ${storedWallet.name}`, e)
    }
  }, [dispatch, pinCode, pinFullyEntered, storedWallet.name, unlockWallet])

  return (
    <Screen style={{ marginTop: 40 }}>
      <CenteredInstructions instructions={shownInstructions} />
      <PinCodeInput pinLength={pinLength} value={pinCode} onPinChange={setPinCode} />
      <SpinnerModal isActive={loading} text="Unlocking your wallet..." />
    </Screen>
  )
}

export default LoginScreen
