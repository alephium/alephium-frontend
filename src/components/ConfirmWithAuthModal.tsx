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

import { getHumanReadableError, walletOpenAsyncUnsafe } from '@alephium/sdk'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import styled from 'styled-components/native'

import { errorInstructionSet, pinLength } from '../screens/LoginScreen'
import { getStoredActiveWallet } from '../storage/wallets'
import { mnemonicToSeed, pbkdf2 } from '../utils/crypto'
import PinCodeInput from './inputs/PinCodeInput'
import ModalWithBackdrop from './ModalWithBackdrop'
import SpinnerModal from './SpinnerModal'
import CenteredInstructions, { Instruction } from './text/CenteredInstructions'

interface ConfirmWithAuthModalProps {
  onConfirm: (pin?: string) => void
  onCancel: () => void
  usePin?: boolean
}

const firstInstructionSet: Instruction[] = [{ text: 'Please enter your pin', type: 'primary' }]

const ConfirmWithAuthModal = ({ onConfirm, onCancel, usePin = false }: ConfirmWithAuthModalProps) => {
  const [pinCode, setPinCode] = useState('')
  const [shownInstructions, setShownInstructions] = useState(firstInstructionSet)
  const [activeWalletEncryptedMnemonic, setActiveWalletEncryptedMnemonic] = useState<string>()
  const [loading, setLoading] = useState(false)

  const getStoredWallet = useCallback(async () => {
    try {
      const storedActiveWallet = await getStoredActiveWallet(usePin)

      if (!storedActiveWallet) return

      if (storedActiveWallet.authType === 'biometrics') {
        onConfirm()
      } else if (storedActiveWallet.authType === 'pin') {
        setActiveWalletEncryptedMnemonic(storedActiveWallet.mnemonic)
      }
    } catch (e: unknown) {
      Alert.alert(getHumanReadableError(e, 'Could not authenticate'))
      onCancel()
    }
  }, [onCancel, onConfirm, usePin])

  const decryptMnemonic = useCallback(async () => {
    if (!activeWalletEncryptedMnemonic) return

    setLoading(true)

    try {
      await walletOpenAsyncUnsafe(pinCode, activeWalletEncryptedMnemonic, pbkdf2, mnemonicToSeed)
      onConfirm(pinCode)
    } catch (e) {
      setShownInstructions(errorInstructionSet)
      setPinCode('')
    } finally {
      setLoading(false)
    }
  }, [activeWalletEncryptedMnemonic, onConfirm, pinCode])

  useEffect(() => {
    getStoredWallet()
  }, [getStoredWallet])

  useEffect(() => {
    if (!pinCode || !activeWalletEncryptedMnemonic) return

    decryptMnemonic()
  }, [activeWalletEncryptedMnemonic, decryptMnemonic, pinCode])

  return (
    <>
      <ModalWithBackdrop animationType="fade" visible={true} closeModal={onCancel}>
        {activeWalletEncryptedMnemonic && (
          <ModalContent>
            <CenteredInstructions instructions={shownInstructions} />
            <PinCodeInput pinLength={pinLength} value={pinCode} onPinChange={setPinCode} />
          </ModalContent>
        )}
      </ModalWithBackdrop>
      <SpinnerModal isActive={loading} text="Verifying passcode..." />
    </>
  )
}

export default ConfirmWithAuthModal

const ModalContent = styled.View`
  flex: 1
  width: 100%;
  background-color: ${({ theme }) => theme.bg.secondary};
  padding-top: 40px;
`
