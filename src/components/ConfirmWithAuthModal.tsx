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
import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import styled from 'styled-components/native'

import { errorInstructionSet, pinLength } from '../screens/LoginScreen'
import { getStoredActiveWallet } from '../storage/wallets'
import { ActiveWalletState } from '../store/activeWalletSlice'
import { mnemonicToSeed, pbkdf2 } from '../utils/crypto'
import PinCodeInput from './inputs/PinCodeInput'
import ModalWithBackdrop from './ModalWithBackdrop'
import SpinnerModal from './SpinnerModal'
import CenteredInstructions, { Instruction } from './text/CenteredInstructions'

interface ConfirmWithAuthModalProps {
  onConfirm: () => void
  onCancel: () => void
}

const firstInstructionSet: Instruction[] = [{ text: 'Please enter your pin', type: 'primary' }]

const ConfirmWithAuthModal = ({ onConfirm, onCancel }: ConfirmWithAuthModalProps) => {
  const [pinCode, setPinCode] = useState('')
  const [shownInstructions, setShownInstructions] = useState(firstInstructionSet)
  const [activeWallet, setActiveWallet] = useState<ActiveWalletState>()
  const [requiresPin, setRequiresPin] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getWallet = async () => {
      try {
        const storedActiveWallet = await getStoredActiveWallet()

        if (storedActiveWallet) {
          setActiveWallet(storedActiveWallet)

          if (storedActiveWallet.authType === 'biometrics') {
            onConfirm()
          } else if (storedActiveWallet.authType === 'pin') {
            setRequiresPin(true)
          }
        }
      } catch (e: unknown) {
        const error = e as { message?: string }

        if (error.message === 'User canceled the authentication') {
          onCancel()
        } else if (error.message === 'No biometrics are currently enrolled') {
          Alert.alert(
            'Authentication required',
            'To authenticate, please set up biometrics (fingerprint) on your device settings and try again.'
          )
        } else {
          console.error(e)
        }
      }
    }

    getWallet()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!requiresPin || !pinCode || !activeWallet) return

    const decryptMnemonic = async () => {
      setLoading(true)

      try {
        await walletOpenAsyncUnsafe(pinCode, activeWallet.mnemonic, pbkdf2, mnemonicToSeed)
        onConfirm()
      } catch (e) {
        setShownInstructions(errorInstructionSet)
        setPinCode('')
      } finally {
        setLoading(false)
      }
    }

    decryptMnemonic()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinCode])

  return (
    <>
      <ModalWithBackdrop animationType="fade" visible={true} closeModal={onCancel}>
        <ModalContent>
          <CenteredInstructions instructions={shownInstructions} />
          <PinCodeInput pinLength={pinLength} value={pinCode} onPinChange={setPinCode} />
        </ModalContent>
      </ModalWithBackdrop>
      <SpinnerModal isActive={loading} />
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
