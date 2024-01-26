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

import { getHumanReadableError, WALLETCONNECT_ERRORS, WalletConnectError } from '@alephium/shared'
import { SignUnsignedTxResult, transactionSign } from '@alephium/web3'
import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import client from '@/api/client'
import InfoBox from '@/components/InfoBox'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal, { ModalContent, ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { unsignedTransactionSignSucceeded } from '@/storage/transactions/transactionsActions'
import { SignUnsignedTxData } from '@/types/transactions'

interface SignUnsignedTxModalProps {
  onClose: () => void
  txData: SignUnsignedTxData
  onSignSuccess: (result: SignUnsignedTxResult) => Promise<void>
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
  const [isLoading, setIsLoading] = useState(false)
  const [decodedUnsignedTx, setDecodedUnsignedTx] = useState<Omit<SignUnsignedTxResult, 'signature'> | undefined>(
    undefined
  )

  useEffect(() => {
    const decodeUnsignedTx = async () => {
      setIsLoading(true)
      const decodedResult = await client.node.transactions.postTransactionsDecodeUnsignedTx({
        unsignedTx: txData.unsignedTx
      })

      setDecodedUnsignedTx({
        txId: decodedResult.unsignedTx.txId,
        fromGroup: decodedResult.fromGroup,
        toGroup: decodedResult.toGroup,
        unsignedTx: txData.unsignedTx,
        gasAmount: decodedResult.unsignedTx.gasAmount,
        gasPrice: BigInt(decodedResult.unsignedTx.gasPrice)
      })

      setIsLoading(false)
    }

    decodeUnsignedTx()
  }, [txData.unsignedTx])

  const handleSign = async () => {
    if (!decodedUnsignedTx) return

    try {
      const signature = transactionSign(decodedUnsignedTx.txId, txData.fromAddress.privateKey)
      const signResult: SignUnsignedTxResult = { signature, ...decodedUnsignedTx }
      await onSignSuccess(signResult)

      dispatch(unsignedTransactionSignSucceeded)
      onClose()
    } catch (e) {
      const message = 'Could not sign unsigned tx'
      posthog.capture('Error', { message })

      onSignFail({
        message: getHumanReadableError(e, message),
        code: WALLETCONNECT_ERRORS.TRANSACTION_SIGN_FAILED
      })
    }
  }

  const handleReject = async () => {
    onSignReject()
    onClose()
  }

  return (
    <CenteredModal
      title={t('Sign Unsigned Transaction')}
      onClose={onClose}
      isLoading={isLoading}
      dynamicContent
      focusMode
      noPadding
    >
      {decodedUnsignedTx && (
        <ModalContent>
          <InputFieldsColumn>
            <InfoBox label={t('Transaction ID')} text={decodedUnsignedTx.txId} wordBreak />
            <InfoBox label={t('Unsigned transaction')} text={decodedUnsignedTx.unsignedTx} wordBreak />
          </InputFieldsColumn>
          <ModalFooterButtons>
            <ModalFooterButton role="secondary" onClick={handleReject}>
              {t('Reject')}
            </ModalFooterButton>
            <ModalFooterButton onClick={handleSign} disabled={isLoading || !decodedUnsignedTx}>
              {t('Sign')}
            </ModalFooterButton>
          </ModalFooterButtons>
        </ModalContent>
      )}
    </CenteredModal>
  )
}

export default SignUnsignedTxModal
