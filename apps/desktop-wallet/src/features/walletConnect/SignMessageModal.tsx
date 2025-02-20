import { keyring } from '@alephium/keyring'
import { getHumanReadableError, WALLETCONNECT_ERRORS } from '@alephium/shared'
import { hashMessage } from '@alephium/web3'
import { AlertTriangle } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import InfoBox from '@/components/InfoBox'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { SignMessageData } from '@/features/walletConnect/walletConnectTypes'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { messageSignFailed, messageSignSucceeded } from '@/storage/transactions/transactionsActions'

export interface SignMessageModalProps {
  txData: SignMessageData
}

const SignMessageModal = memo(({ id, txData }: ModalBaseProp & SignMessageModalProps) => {
  const { t } = useTranslation()
  const { sendAnalytics } = useAnalytics()
  const dispatch = useAppDispatch()
  const { sendSuccessResponse, sendFailureResponse, sendUserRejectedResponse } = useWalletConnectContext()
  const { isLedger } = useLedger()

  const handleSign = async () => {
    try {
      const messageHash = hashMessage(txData.message, txData.messageHasher)

      const signature = keyring.signMessageHash(messageHash, txData.fromAddress.hash)

      await sendSuccessResponse({ signature }, true)

      dispatch(messageSignSucceeded)
      dispatch(closeModal({ id }))
    } catch (error) {
      const message = 'Could not sign message'
      const errorMessage = getHumanReadableError(error, t(message))

      sendAnalytics({ type: 'error', message })
      dispatch(messageSignFailed(errorMessage))

      sendFailureResponse({
        message: getHumanReadableError(error, message),
        code: WALLETCONNECT_ERRORS.MESSAGE_SIGN_FAILED
      })
    }
  }

  const rejectAndClose = (hideApp?: boolean) => {
    dispatch(closeModal({ id }))
    sendUserRejectedResponse(hideApp)
  }

  return (
    <CenteredModal id={id} title={t('Sign Message')} onClose={rejectAndClose} dynamicContent focusMode hasFooterButtons>
      <InputFieldsColumn>
        <InfoBox label={t('Message')} text={txData.message} />
      </InputFieldsColumn>
      {isLedger && (
        <InputFieldsColumn>
          <InfoBox
            text={t('Signing messages with Ledger is not supported.')}
            importance="warning"
            Icon={AlertTriangle}
          />
        </InputFieldsColumn>
      )}
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={() => rejectAndClose(true)}>
          {t('Reject')}
        </ModalFooterButton>
        {!isLedger && <ModalFooterButton onClick={handleSign}>{t('Sign')}</ModalFooterButton>}
      </ModalFooterButtons>
    </CenteredModal>
  )
})

export default SignMessageModal
