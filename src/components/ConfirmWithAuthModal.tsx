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

import { getStoredActiveWallet, getStoredWalletById } from '../storage/wallets'
import { ActiveWalletState } from '../store/activeWalletSlice'
import { mnemonicToSeed, pbkdf2 } from '../utils/crypto'
import PinCodeInput from './inputs/PinCodeInput'
import ModalWithBackdrop from './ModalWithBackdrop'
import SpinnerModal from './SpinnerModal'
import CenteredInstructions, { Instruction } from './text/CenteredInstructions'

interface ConfirmWithAuthModalProps {
  onConfirm: (pin?: string, wallet?: ActiveWalletState) => void
  usePin?: boolean
  walletId?: string
}

const pinLength = 6

const firstInstructionSet: Instruction[] = [
  { text: 'Please enter your pin', type: 'primary' },
  { text: 'More info', type: 'link', url: 'https://docs.alephium.org/Frequently-Asked-Questions.html' }
]

const errorInstructionSet: Instruction[] = [
  { text: 'Oops, wrong pin!', type: 'error' },
  { text: 'Please try again 💪', type: 'secondary' }
]

const ConfirmWithAuthModal = ({ onConfirm, walletId, usePin = false }: ConfirmWithAuthModalProps) => {
  const [pinCode, setPinCode] = useState('')
  const [shownInstructions, setShownInstructions] = useState(firstInstructionSet)
  const [encryptedWallet, setEncryptedWallet] = useState<ActiveWalletState>()
  const [loading, setLoading] = useState(false)
  const [shouldHideModal, setShouldHideModal] = useState(false)

  const getStoredWallet = useCallback(async () => {
    try {
      const storedWallet = walletId ? await getStoredWalletById(walletId, usePin) : await getStoredActiveWallet(usePin)

      if (!storedWallet) return

      if (storedWallet.authType === 'biometrics') {
        onConfirm()
        setShouldHideModal(true)
      } else if (storedWallet.authType === 'pin') {
        setEncryptedWallet(storedWallet)
      }
    } catch (e: unknown) {
      Alert.alert(getHumanReadableError(e, 'Could not authenticate'))
    }
  }, [onConfirm, usePin, walletId])

  const decryptMnemonic = useCallback(async () => {
    if (!pinCode || !encryptedWallet) return

    setLoading(true)

    try {
      const decryptedWallet = await walletOpenAsyncUnsafe(pinCode, encryptedWallet.mnemonic, pbkdf2, mnemonicToSeed)
      onConfirm(pinCode, { ...encryptedWallet, mnemonic: decryptedWallet.mnemonic })
      setShouldHideModal(true)
    } catch (e) {
      setShownInstructions(errorInstructionSet)
      setPinCode('')
    } finally {
      setLoading(false)
    }
  }, [encryptedWallet, onConfirm, pinCode])

  useEffect(() => {
    getStoredWallet()
  }, [getStoredWallet])

  useEffect(() => {
    if (pinCode) decryptMnemonic()
  }, [decryptMnemonic, pinCode])

  if (shouldHideModal) return null

  return (
    <>
      <ModalWithBackdrop animationType="fade" visible>
        {encryptedWallet && (
          <ModalContent>
            <CenteredInstructions instructions={shownInstructions} />
            <PinCodeInput pinLength={pinLength} value={pinCode} onPinChange={setPinCode} />
          </ModalContent>
        )}
      </ModalWithBackdrop>
      <SpinnerModal isActive={loading} text="Verifying pin..." />
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
