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

import { walletOpenAsyncUnsafe } from '@alephium/shared'
import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import Button from '~/components/buttons/Button'
import PinCodeInput from '~/components/inputs/PinCodeInput'
import { ScreenSection } from '~/components/layout/Screen'
import ModalWithBackdrop, { ModalWithBackdropProps } from '~/components/ModalWithBackdrop'
import { Spinner } from '~/components/SpinnerModal'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import { loadBiometricsSettings } from '~/persistent-storage/settings'
import { getStoredWallet, GetStoredWalletProps } from '~/persistent-storage/wallet'
import { ShouldClearPin } from '~/types/misc'
import { WalletState } from '~/types/wallet'
import { mnemonicToSeed, pbkdf2 } from '~/utils/crypto'

interface AuthenticationModalProps extends ModalWithBackdropProps, GetStoredWalletProps {
  onConfirm: (pin?: string, wallet?: WalletState) => void
  onClose?: () => void
  loadingText?: string
}

const pinLength = 6

const firstInstructionSet: Instruction[] = [{ text: 'Please enter your pin', type: 'primary' }]

const errorInstructionSet: Instruction[] = [
  { text: 'Oops, wrong pin!', type: 'error' },
  { text: 'Please try again 💪', type: 'secondary' }
]

const AuthenticationModal = ({
  onConfirm,
  onClose,
  forcePinUsage = false,
  authenticationPrompt,
  loadingText,
  ...props
}: AuthenticationModalProps) => {
  const insets = useSafeAreaInsets()

  const [shownInstructions, setShownInstructions] = useState(firstInstructionSet)
  const [encryptedWallet, setEncryptedWallet] = useState<WalletState>()

  const getWallet = useCallback(async () => {
    try {
      const storedWallet = await getStoredWallet({ forcePinUsage, authenticationPrompt })

      // This should never happen, but if it does, inform the user instead of being stuck
      if (!storedWallet) {
        Alert.alert('Missing wallet', 'Could not find wallet to authenticate. Please, restart the app')
        return
      }

      const usesBiometrics = forcePinUsage ? false : await loadBiometricsSettings()

      if (usesBiometrics) {
        onConfirm()
        onClose && onClose()
      } else {
        setEncryptedWallet(storedWallet)
      }
    } catch (e: unknown) {
      const error = e as { message?: string }

      if (!error.message?.includes('User canceled')) {
        console.error(e)
      }

      onClose && onClose()
    }
  }, [authenticationPrompt, forcePinUsage, onConfirm, onClose])

  const decryptMnemonic = async (pin: string): Promise<ShouldClearPin> => {
    if (!pin || !encryptedWallet) return false

    try {
      const decryptedWallet = await walletOpenAsyncUnsafe(pin, encryptedWallet.mnemonic, pbkdf2, mnemonicToSeed)
      onConfirm(pin, { ...encryptedWallet, mnemonic: decryptedWallet.mnemonic })
      onClose && onClose()

      return false
    } catch (e) {
      setShownInstructions(errorInstructionSet)

      return true
    }
  }

  useEffect(() => {
    if (props.visible) getWallet()
  }, [getWallet, props.visible])

  return (
    <ModalWithBackdrop closeModal={onClose} {...props}>
      {encryptedWallet ? (
        <ModalContent style={{ paddingTop: !onClose ? insets.top + 60 : undefined }}>
          {onClose && (
            <HeaderSection style={{ paddingTop: insets.top }}>
              <Button round iconProps={{ name: 'arrow-back-outline' }} onPress={onClose} />
            </HeaderSection>
          )}
          <CenteredInstructions instructions={shownInstructions} />
          <PinCodeInput pinLength={pinLength} onPinEntered={decryptMnemonic} />
        </ModalContent>
      ) : (
        <Spinner text={loadingText || 'Loading wallet...'} />
      )}
    </ModalWithBackdrop>
  )
}

export default AuthenticationModal

const ModalContent = styled.View`
  flex: 1;
  width: 100%;
  background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.highlight : theme.bg.back2)};
`

const HeaderSection = styled(ScreenSection)`
  padding-bottom: 90px;
`
