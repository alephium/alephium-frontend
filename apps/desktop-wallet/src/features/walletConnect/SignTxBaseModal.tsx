import {
  getHumanReadableError,
  SignDeployContractTxModalProps,
  SignExecuteScriptTxModalProps,
  SignTransferTxModalProps
} from '@alephium/shared'
import { ReactNode, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { closeModal, openModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import CheckModalContent from '@/features/send/CheckModalContent'
import { selectEffectivePasswordRequirement } from '@/features/settings/settingsSelectors'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { transactionSendFailed } from '@/storage/transactions/transactionsActions'

interface SignTxBaseModalProps extends ModalBaseProp {
  children: ReactNode
  title: string
  onSignAndSubmit: () => Promise<void>
  lockTime?: number
}

const SignTxBaseModal = ({
  children,
  title,
  lockTime,
  onSignAndSubmit,
  txParams,
  id,
  onError,
  onUserDismiss
}: (SignDeployContractTxModalProps | SignExecuteScriptTxModalProps | SignTransferTxModalProps) &
  SignTxBaseModalProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const passwordRequirement = useAppSelector(selectEffectivePasswordRequirement)
  const { isLedger } = useLedger()
  const { sendAnalytics } = useAnalytics()

  const [isLoading, setIsLoading] = useState(false)

  const handleError = useCallback(
    (e: unknown) => {
      // https://github.com/alephium/alephium-frontend/issues/610
      const error = (e as unknown as string).toString()
      const message = 'Error while sending the transaction'
      const errorMessage = getHumanReadableError(e, t(message))

      if (error.includes('NotEnoughApprovedBalance')) {
        dispatch(transactionSendFailed('Your address does not have enough balance for this transaction'))
      } else {
        dispatch(transactionSendFailed(errorMessage))
        sendAnalytics({ type: 'error', message })
      }
      onError(errorMessage)
    },
    [dispatch, onError, sendAnalytics, t]
  )

  const signAndSubmit = useCallback(async () => {
    try {
      setIsLoading(isLedger ? t('Please, confirm the transaction on your Ledger.') : true)

      await onSignAndSubmit()
    } catch (e) {
      handleError(e)
    } finally {
      dispatch(closeModal({ id }))
      setIsLoading(false)
    }
  }, [isLedger, t, onSignAndSubmit, handleError, dispatch, id])

  const checkPassword = useCallback(() => {
    if (passwordRequirement) {
      dispatch(
        openModal({
          name: 'PasswordConfirmationModal',
          props: { onCorrectPasswordEntered: signAndSubmit }
        })
      )
    } else {
      signAndSubmit()
    }
  }, [dispatch, passwordRequirement, signAndSubmit])

  const handleApprovePress = useCallback(() => {
    if (lockTime) {
      dispatch(
        openModal({
          name: 'ConfirmLockTimeModal',
          props: { lockTime: new Date(lockTime), onSubmit: checkPassword }
        })
      )
    } else {
      checkPassword()
    }
  }, [lockTime, dispatch, checkPassword])

  const handleRejectPress = useCallback(() => {
    dispatch(closeModal({ id }))
    onUserDismiss?.()
  }, [dispatch, id, onUserDismiss])

  return (
    <CenteredModal
      id={id}
      title={title}
      onClose={handleRejectPress}
      isLoading={isLoading}
      focusMode
      disableBack
      hasFooterButtons
    >
      <CheckModalContent>{children}</CheckModalContent>
      <ModalFooterButtons>
        <ModalFooterButton onClick={handleRejectPress} role="secondary">
          {t('Reject')}
        </ModalFooterButton>
        <ModalFooterButton onClick={handleApprovePress} variant="valid">
          {t('Approve')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
}

export default SignTxBaseModal
