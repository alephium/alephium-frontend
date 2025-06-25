import {
  getHumanReadableError,
  selectAddressByHash,
  SignDeployContractTxModalProps,
  SignExecuteScriptTxModalProps,
  SignTransferTxModalProps
} from '@alephium/shared'
import { ReactNode, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useLedger } from '@/features/ledger/useLedger'
import { closeModal, openModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import CheckModalContent from '@/features/send/CheckModalContent'
import { selectEffectivePasswordRequirement } from '@/features/settings/settingsSelectors'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'

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
  const signerAddress = useAppSelector((s) => selectAddressByHash(s, txParams.signerAddress))
  const { isLedger } = useLedger()

  const [isLoading, setIsLoading] = useState(false)

  const signAndSubmit = useCallback(async () => {
    try {
      if (!signerAddress) {
        throw Error('Signer address not found')
      }

      setIsLoading(isLedger ? t('Please, confirm the transaction on your Ledger.') : true)

      await onSignAndSubmit()
    } catch (error) {
      onError(getHumanReadableError(error, t('Error while sending the transaction')))
      // TODO: show toast
      // TODO: analytics
    } finally {
      dispatch(closeModal({ id }))
      setIsLoading(false)
    }
  }, [signerAddress, isLedger, t, onSignAndSubmit, onError, dispatch, id])

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
