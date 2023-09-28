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
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import Button from '~/components/buttons/Button'
import PinCodeInput from '~/components/inputs/PinCodeInput'
import { ScreenSection } from '~/components/layout/Screen'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import { loadBiometricsSettings } from '~/persistent-storage/settings'
import { getStoredWallet } from '~/persistent-storage/wallet'
import { ShouldClearPin } from '~/types/misc'
import { WalletState } from '~/types/wallet'
import { mnemonicToSeed, pbkdf2 } from '~/utils/crypto'

interface ConfirmWithAuthModalProps {
  onConfirm: (pin?: string, wallet?: WalletState) => void
  onClose?: () => void
  usePin?: boolean
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

const ConfirmWithAuthModal = ({ onConfirm, onClose, usePin = false }: ConfirmWithAuthModalProps) => {
  const insets = useSafeAreaInsets()

  const [shownInstructions, setShownInstructions] = useState(firstInstructionSet)
  const [encryptedWallet, setEncryptedWallet] = useState<WalletState>()
  const [shouldHideModal, setShouldHideModal] = useState(false)

  const getWallet = useCallback(async () => {
    try {
      const storedWallet = await getStoredWallet(usePin)
      const usesBiometrics = await loadBiometricsSettings()

      if (usesBiometrics) {
        onConfirm()
        setShouldHideModal(true)
      } else if (storedWallet) {
        setEncryptedWallet(storedWallet)
      }
    } catch (e: unknown) {
      Alert.alert(getHumanReadableError(e, 'Could not authenticate'))
    }
  }, [onConfirm, usePin])

  const decryptMnemonic = async (pin: string): Promise<ShouldClearPin> => {
    if (!pin || !encryptedWallet) return false

    try {
      const decryptedWallet = await walletOpenAsyncUnsafe(pin, encryptedWallet.mnemonic, pbkdf2, mnemonicToSeed)
      onConfirm(pin, { ...encryptedWallet, mnemonic: decryptedWallet.mnemonic })
      setShouldHideModal(true)

      return false
    } catch (e) {
      setShownInstructions(errorInstructionSet)

      return true
    }
  }

  useEffect(() => {
    getWallet()
  }, [getWallet])

  if (shouldHideModal) return null

  return (
    <ModalWithBackdrop animationType="fade" visible closeModal={onClose}>
      {encryptedWallet && (
        <ModalContent style={{ paddingTop: insets.top + 50 }}>
          {onClose && (
            <HeaderSection>
              <Button type="transparent" iconProps={{ name: 'close-outline' }} onPress={onClose} />
            </HeaderSection>
          )}
          <CenteredInstructions instructions={shownInstructions} />
          <PinCodeInput pinLength={pinLength} onPinEntered={decryptMnemonic} />
        </ModalContent>
      )}
    </ModalWithBackdrop>
  )
}

export default ConfirmWithAuthModal

const ModalContent = styled.View`
  flex: 1;
  width: 100%;
  background-color: ${({ theme }) => theme.bg.back2};
  padding-top: 40px;
`

const HeaderSection = styled(ScreenSection)`
  align-items: flex-end;
`
