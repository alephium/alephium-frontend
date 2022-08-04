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
import LottieView from 'lottie-react-native'
import { useCallback, useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import styled from 'styled-components/native'

import animationSrc from '../animations/wallet.json'
import PinCodeInput from '../components/inputs/PinCodeInput'
import Screen from '../components/layout/Screen'
import CenteredInstructions, { Instruction } from '../components/text/CenteredInstructions'
import { useAppDispatch } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { activeWalletChanged, ActiveWalletState } from '../store/activeWalletSlice'
import { pinEntered } from '../store/credentialsSlice'
import { mnemonicToSeed, pbkdf2 } from '../utils/crypto'

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
  const dispatch = useAppDispatch()
  const [pinCode, setPinCode] = useState('')
  const [shownInstructions, setShownInstructions] = useState(firstInstructionSet)
  const storedActiveEncryptedWallet = route.params.storedWallet as ActiveWalletState
  const pinFullyEntered = pinCode.length === pinLength
  const [loading, setLoading] = useState(false)

  useFocusEffect(
    useCallback(() => {
      setShownInstructions(firstInstructionSet)
      setPinCode('')
    }, [])
  )

  const openWallet = useCallback(async () => {
    const wallet = await walletOpenAsyncUnsafe(pinCode, storedActiveEncryptedWallet.mnemonic, pbkdf2, mnemonicToSeed)
    dispatch(
      activeWalletChanged({
        ...storedActiveEncryptedWallet,
        mnemonic: wallet.mnemonic
      })
    )
    setPinCode('')
    navigation.navigate('DashboardScreen')
  }, [dispatch, pinCode, storedActiveEncryptedWallet, navigation])

  useEffect(() => {
    if (!pinFullyEntered) return

    setLoading(true)

    try {
      dispatch(pinEntered(pinCode))
      openWallet()
    } catch (e) {
      setShownInstructions(errorInstructionSet)
      setPinCode('')
      console.error(`Could not unlock wallet ${storedActiveEncryptedWallet.name}`, e)
    }
  }, [dispatch, pinCode, pinFullyEntered, openWallet, storedActiveEncryptedWallet])

  return (
    <Screen style={{ marginTop: 40 }}>
      {!loading ? (
        <>
          <CenteredInstructions instructions={shownInstructions} />
          <PinCodeInput pinLength={pinLength} value={pinCode} onPinChange={setPinCode} />
        </>
      ) : (
        <Centered>
          <StyledAnimation source={animationSrc} autoPlay />
          <Text>Unlocking your wallet...</Text>
        </Centered>
      )}
    </Screen>
  )
}

export default LoginScreen

const StyledAnimation = styled(LottieView)`
  width: 40%;
`

const Centered = styled(View)`
  flex: 1;
  justify-content: center;
  align-items: center;
`
