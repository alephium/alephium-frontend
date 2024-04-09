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

import { keyring } from '@alephium/keyring'
import { getHumanReadableError, WALLETCONNECT_ERRORS, WalletConnectError } from '@alephium/shared'
import { hashMessage, SignMessageResult } from '@alephium/web3'
import { usePostHog } from 'posthog-js/react'
import { useTranslation } from 'react-i18next'

import InfoBox from '@/components/InfoBox'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal, { ModalContent, ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { messageSignFailed, messageSignSucceeded } from '@/storage/transactions/transactionsActions'
import { SignMessageData } from '@/types/transactions'

interface SignUnsignedTxModalProps {
  onClose: () => void
  txData: SignMessageData
  onSignSuccess: (result: SignMessageResult) => Promise<void>
  onSignFail: (error: WalletConnectError) => Promise<void>
  onSignReject: () => Promise<void>
}

const SignUnsignedTxModal = ({
  onClose,
  txData,
  onSignSuccess,
  onSignFail,
  onSignReject
}: SignUnsignedTxModalProps) => {
  const { t } = useTranslation()
  const posthog = usePostHog()
  const dispatch = useAppDispatch()

  const handleSign = async () => {
    try {
      const messageHash = hashMessage(txData.message, txData.messageHasher)
      const signature = keyring.signMessage(messageHash, txData.fromAddress.hash)

      await onSignSuccess({ signature })

      dispatch(messageSignSucceeded)
      onClose()
    } catch (e) {
      const message = 'Could not sign message'
      const errorMessage = getHumanReadableError(e, t(message))
      posthog.capture('Error', { message })
      dispatch(messageSignFailed(errorMessage))

      onSignFail({
        message: getHumanReadableError(e, message),
        code: WALLETCONNECT_ERRORS.MESSAGE_SIGN_FAILED
      })
    }
  }

  const handleReject = async () => {
    onSignReject()
    onClose()
  }

  return (
    <CenteredModal title={t('Sign Message')} onClose={onClose} dynamicContent focusMode noPadding>
      <ModalContent>
        <InputFieldsColumn>
          <InfoBox label={t('Message')} text={txData.message} />
        </InputFieldsColumn>
        <ModalFooterButtons>
          <ModalFooterButton role="secondary" onClick={handleReject}>
            {t('Reject')}
          </ModalFooterButton>
          <ModalFooterButton onClick={handleSign}>{t('Sign')}</ModalFooterButton>
        </ModalFooterButtons>
      </ModalContent>
    </CenteredModal>
  )
}

export default SignUnsignedTxModal
