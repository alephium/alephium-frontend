import { keyring } from '@alephium/keyring'
import { getHumanReadableError, throttledClient, WALLETCONNECT_ERRORS } from '@alephium/shared'
import { SignUnsignedTxResult } from '@alephium/web3'
import { usePostHog } from 'posthog-js/react'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import InfoBox from '@/components/InfoBox'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { LedgerAlephium } from '@/features/ledger/utils'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { SignUnsignedTxData } from '@/features/walletConnect/walletConnectTypes'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import {
  transactionSent,
  unsignedTransactionDecodingFailed,
  unsignedTransactionSignFailed,
  unsignedTransactionSignSucceeded
} from '@/storage/transactions/transactionsActions'

export interface SignUnsignedTxModalProps {
  txData: SignUnsignedTxData
  submit?: boolean
  dAppUrl: string
}

const SignUnsignedTxModal = memo(
  ({ id, txData, submit = false, dAppUrl }: ModalBaseProp & SignUnsignedTxModalProps) => {
    const { t } = useTranslation()
    const { sendAnalytics } = useAnalytics()
    const dispatch = useAppDispatch()
    const { sendUserRejectedResponse, sendSuccessResponse, sendFailureResponse } = useWalletConnectContext()
    const { isLedger, onLedgerError } = useLedger()
    const posthog = usePostHog()

    const [isLoading, setIsLoading] = useState(false)
    const [decodedUnsignedTx, setDecodedUnsignedTx] = useState<Omit<SignUnsignedTxResult, 'signature'> | undefined>(
      undefined
    )

    useEffect(() => {
      const decodeUnsignedTx = async () => {
        setIsLoading(true)

        try {
          const decodedResult = await throttledClient.node.transactions.postTransactionsDecodeUnsignedTx({
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
        } catch (e) {
          const message = 'Could not decode unsigned tx'
          const errorMessage = getHumanReadableError(e, t(message))

          sendAnalytics({ type: 'error', message })
          dispatch(unsignedTransactionDecodingFailed(errorMessage))
          sendFailureResponse({
            message: getHumanReadableError(e, message),
            code: WALLETCONNECT_ERRORS.TRANSACTION_DECODE_FAILED
          })
        } finally {
          setIsLoading(false)
        }
      }

      decodeUnsignedTx()
    }, [dispatch, sendFailureResponse, sendAnalytics, t, txData.unsignedTx])

    const handleSign = async () => {
      if (!decodedUnsignedTx) return

      setIsLoading(true)

      try {
        const signature = isLedger
          ? await LedgerAlephium.create()
              .catch(onLedgerError)
              .then((app) => (app ? app.signUnsignedTx(txData.fromAddress.index, decodedUnsignedTx.unsignedTx) : null))
          : keyring.signTransaction(decodedUnsignedTx.txId, txData.fromAddress.hash)

        if (!signature) {
          throw new Error()
        }

        const signResult: SignUnsignedTxResult = { signature, ...decodedUnsignedTx }

        if (submit) {
          const data = await throttledClient.node.transactions.postTransactionsSubmit({
            unsignedTx: decodedUnsignedTx.unsignedTx,
            signature
          })

          dispatch(
            transactionSent({
              hash: data.txId,
              fromAddress: txData.fromAddress.hash,
              toAddress: '',
              timestamp: new Date().getTime(),
              type: 'transfer',
              status: 'sent'
            })
          )

          posthog.capture('Signed and submitted unsigned transaction')
        }

        await sendSuccessResponse(signResult, true)

        dispatch(unsignedTransactionSignSucceeded())
        dispatch(closeModal({ id }))
      } catch (error) {
        const message = 'Could not sign unsigned tx'
        const errorMessage = getHumanReadableError(error, t(message))

        sendAnalytics({ type: 'error', message })
        dispatch(unsignedTransactionSignFailed(errorMessage))
        sendFailureResponse({
          message: getHumanReadableError(error, message),
          code: WALLETCONNECT_ERRORS.TRANSACTION_SIGN_FAILED
        })
      } finally {
        setIsLoading(false)
      }
    }

    const rejectAndClose = (hideApp?: boolean) => {
      dispatch(closeModal({ id }))
      sendUserRejectedResponse(hideApp)
    }

    return (
      <CenteredModal
        id={id}
        title={t(submit ? 'Sign and Send Unsigned Transaction' : 'Sign Unsigned Transaction')}
        subtitle={dAppUrl}
        onClose={rejectAndClose}
        isLoading={isLoading}
        focusMode
        hasFooterButtons
      >
        {decodedUnsignedTx && (
          <>
            <InputFieldsColumn>
              <InfoBox label={t('Transaction ID')} text={decodedUnsignedTx.txId} wordBreak />
              <InfoBox label={t('Unsigned transaction')} text={decodedUnsignedTx.unsignedTx} wordBreak />
            </InputFieldsColumn>
            <ModalFooterButtons>
              <ModalFooterButton role="secondary" onClick={() => rejectAndClose(true)}>
                {t('Reject')}
              </ModalFooterButton>
              <ModalFooterButton onClick={handleSign} disabled={isLoading || !decodedUnsignedTx}>
                {submit ? t('Sign and Send') : t('Sign')}
              </ModalFooterButton>
            </ModalFooterButtons>
          </>
        )}
      </CenteredModal>
    )
  }
)

export default SignUnsignedTxModal
