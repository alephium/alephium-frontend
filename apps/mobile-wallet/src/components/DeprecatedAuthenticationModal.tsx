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

import { DeprecatedEncryptedMnemonicStoredAsString } from '@alephium/keyring'
import { decryptAsync } from '@alephium/shared-crypto'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import Button from '~/components/buttons/Button'
import PinCodeInput from '~/components/inputs/PinCodeInput'
import { ScreenSection } from '~/components/layout/Screen'
import ModalWithBackdrop, { ModalWithBackdropProps } from '~/components/ModalWithBackdrop'
import { Spinner } from '~/components/SpinnerModal'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import i18n from '~/features/localization/i18n'
import { loadBiometricsSettings } from '~/persistent-storage/settings'
import { getDeprecatedStoredWallet, GetDeprecatedStoredWalletProps } from '~/persistent-storage/wallet'
import { ShouldClearPin } from '~/types/misc'
import { DeprecatedWalletState } from '~/types/wallet'
import { pbkdf2 } from '~/utils/crypto'

interface DeprecatedAuthenticationModalProps extends ModalWithBackdropProps, GetDeprecatedStoredWalletProps {
  onConfirm: (deprecatedMnemonic?: string) => void
  onClose?: () => void
  loadingText?: string
}

const pinLength = 6

const firstInstructionSet: Instruction[] = [{ text: i18n.t('Please enter your pin'), type: 'primary' }]

const errorInstructionSet: Instruction[] = [
  { text: 'Oops, wrong pin!', type: 'error' },
  { text: 'Please try again 💪', type: 'secondary' }
]

const DeprecatedAuthenticationModal = ({
  onConfirm,
  onClose,
  forcePinUsage = false,
  authenticationPrompt,
  loadingText,
  ...props
}: DeprecatedAuthenticationModalProps) => {
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()

  const [shownInstructions, setShownInstructions] = useState(firstInstructionSet)
  const [deprecatedEncryptedWallet, setDeprecatedEncryptedWallet] = useState<DeprecatedWalletState>()

  const getWallet = useCallback(async () => {
    try {
      const deprecatedStoredWallet = await getDeprecatedStoredWallet({ forcePinUsage, authenticationPrompt })

      // This should never happen, but if it does, inform the user instead of being stuck
      if (!deprecatedStoredWallet) {
        Alert.alert(t('Missing wallet'), t('Could not find wallet to authenticate. Please, restart the app.'))
        return
      }

      const usesBiometrics = forcePinUsage ? false : await loadBiometricsSettings()

      if (usesBiometrics) {
        onConfirm()
        onClose && onClose()
      } else {
        setDeprecatedEncryptedWallet(deprecatedStoredWallet)
      }
    } catch (e: unknown) {
      const error = e as { message?: string }

      if (!error.message?.includes('User canceled')) {
        console.error(e)
      }

      onClose && onClose()
    }
  }, [forcePinUsage, authenticationPrompt, t, onConfirm, onClose])

  const decryptDeprecatedMnemonic = async (pin: string): Promise<ShouldClearPin> => {
    if (!pin || !deprecatedEncryptedWallet) return false

    try {
      const data = await decryptAsync(pin, deprecatedEncryptedWallet.mnemonic, pbkdf2)
      const { mnemonic } = JSON.parse(data) as DeprecatedEncryptedMnemonicStoredAsString

      onConfirm(mnemonic)
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
      {deprecatedEncryptedWallet ? (
        <ModalContent style={{ paddingTop: !onClose ? insets.top + 60 : undefined }}>
          {onClose && (
            <HeaderSection style={{ paddingTop: insets.top }}>
              <Button round iconProps={{ name: 'arrow-back-outline' }} onPress={onClose} />
            </HeaderSection>
          )}
          <CenteredInstructions instructions={shownInstructions} />
          <PinCodeInput pinLength={pinLength} onPinEntered={decryptDeprecatedMnemonic} />
        </ModalContent>
      ) : (
        <Spinner text={loadingText || `${t('Loading wallet')}...`} />
      )}
    </ModalWithBackdrop>
  )
}

export default DeprecatedAuthenticationModal

const ModalContent = styled.View`
  flex: 1;
  width: 100%;
  background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.highlight : theme.bg.back2)};
`

const HeaderSection = styled(ScreenSection)`
  padding-bottom: 90px;
`
