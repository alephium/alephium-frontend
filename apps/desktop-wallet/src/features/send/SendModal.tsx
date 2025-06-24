import { Address, getHumanReadableError, WALLETCONNECT_ERRORS } from '@alephium/shared'
import { node } from '@alephium/web3'
import { colord } from 'colord'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import { buildSweepTransactions } from '@/api/transactions'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { closeModal, openModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import CallContractAddressesTxModalContent from '@/features/send/sendModals/callContract/AddressesTxModalContent'
import CallContractBuildTxModalContent from '@/features/send/sendModals/callContract/BuildTxModalContent'
import {
  buildCallContractTransaction,
  getCallContractWalletConnectResult,
  handleCallContractSend
} from '@/features/send/sendModals/callContract/CallContractSendModal'
import CallContractCheckTxModalContent from '@/features/send/sendModals/callContract/CheckTxModalContent'
import TransferAddressesTxModalContent from '@/features/send/sendModals/transfer/AddressesTxModalContent'
import TransferBuildTxModalContent from '@/features/send/sendModals/transfer/BuildTxModalContent'
import TransferCheckTxModalContent from '@/features/send/sendModals/transfer/CheckTxModalContent'
import {
  buildTransferTransaction,
  getTransferWalletConnectResult,
  handleTransferSend
} from '@/features/send/sendModals/transfer/TransferSendModal'
import {
  AddressesTxModalData,
  CallContractTxData,
  TransferTxData,
  TxContext,
  TxData,
  UnsignedTx
} from '@/features/send/sendTypes'
import { Step } from '@/features/send/StepsProgress'
import { selectEffectivePasswordRequirement } from '@/features/settings/settingsSelectors'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ScrollableModalContent } from '@/modals/CenteredModal'
import { transactionBuildFailed, transactionSendFailed } from '@/storage/transactions/transactionsActions'

export type ConfigurableSendModalProps<PT extends { fromAddress: Address }> = {
  txData?: TxData
  initialTxData: PT
  initialStep?: Step
  triggeredByWalletConnect?: boolean
  dAppUrl?: string
}

export interface SendModalProps<PT extends { fromAddress: Address }> extends ConfigurableSendModalProps<PT> {
  title: string
  type: 'transfer' | 'call-contract'
}

function SendModal<PT extends { fromAddress: Address }>({
  title,
  initialTxData,
  txData,
  initialStep,
  type,
  id,
  triggeredByWalletConnect,
  dAppUrl
}: ModalBaseProp & SendModalProps<PT>) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const passwordRequirement = useAppSelector(selectEffectivePasswordRequirement)
  const posthog = usePostHog()
  const { sendAnalytics } = useAnalytics()
  const { sendUserRejectedResponse, sendSuccessResponse, sendFailureResponse } = useWalletConnectContext()
  const { isLedger, onLedgerError } = useLedger()

  const [addressesData, setAddressesData] = useState<AddressesTxModalData>(txData ?? initialTxData)
  const [transactionData, setTransactionData] = useState(txData)
  const [isLoading, setIsLoading] = useState<boolean | string>(false)
  const [step, setStep] = useState<Step>('addresses')
  const [consolidationRequired, setConsolidationRequired] = useState(false)
  const [isSweeping, setIsSweeping] = useState(false)
  const [sweepUnsignedTxs, setSweepUnsignedTxs] = useState<node.SweepAddressTransaction[]>([])
  const [fees, setFees] = useState<bigint>()
  const [unsignedTxId, setUnsignedTxId] = useState('')
  const [unsignedTransaction, setUnsignedTransaction] = useState<UnsignedTx>()
  const [buildExecuteScriptTxResult, setBuildExecuteScriptTxResult] = useState<node.BuildExecuteScriptTxResult>()
  const [isTransactionBuildTriggered, setIsTransactionBuildTriggered] = useState(false)

  const isRequestToApproveContractCall = initialStep === 'info-check'

  const onClose = useCallback(() => {
    dispatch(closeModal({ id }))

    if (triggeredByWalletConnect) sendUserRejectedResponse()
  }, [dispatch, id, sendUserRejectedResponse, triggeredByWalletConnect])

  const txContext: TxContext = useMemo(
    () => ({
      setIsSweeping,
      sweepUnsignedTxs,
      setSweepUnsignedTxs,
      setFees,
      unsignedTransaction,
      setUnsignedTransaction,
      unsignedTxId,
      setUnsignedTxId,
      isSweeping,
      buildExecuteScriptTxResult,
      setBuildExecuteScriptTxResult
    }),
    [buildExecuteScriptTxResult, isSweeping, sweepUnsignedTxs, unsignedTransaction, unsignedTxId]
  )

  const handleSendExtended = useCallback(
    async (consolidationRequired: boolean) => {
      if (!transactionData) return

      setIsLoading(isLedger ? t('Please, confirm the transaction on your Ledger.') : true)

      try {
        const signature =
          type === 'transfer'
            ? await handleTransferSend(
                transactionData as TransferTxData,
                txContext,
                posthog,
                isLedger,
                onLedgerError,
                consolidationRequired
              )
            : await handleCallContractSend(
                transactionData as CallContractTxData,
                txContext,
                posthog,
                isLedger,
                onLedgerError
              )

        if (signature && triggeredByWalletConnect) {
          const result =
            type === 'transfer'
              ? getTransferWalletConnectResult(txContext, signature)
              : getCallContractWalletConnectResult(txContext, signature)

          sendSuccessResponse(result)
        }

        setStep('tx-sent')
      } catch (error) {
        dispatch(transactionSendFailed(getHumanReadableError(error, t('Error while sending the transaction'))))
        sendAnalytics({ type: 'error', message: 'Could not send tx' })

        if (triggeredByWalletConnect) {
          sendFailureResponse({
            message: getHumanReadableError(error, 'Error while sending the transaction'),
            code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
          })
          dispatch(closeModal({ id }))
        }
      } finally {
        setIsLoading(false)
      }
    },
    [
      dispatch,
      id,
      isLedger,
      onLedgerError,
      posthog,
      sendAnalytics,
      sendFailureResponse,
      sendSuccessResponse,
      t,
      transactionData,
      triggeredByWalletConnect,
      txContext,
      type
    ]
  )

  const goToAddresses = useCallback(() => setStep('addresses'), [])
  const goToBuildTx = useCallback(() => setStep('build-tx'), [])
  const goToInfoCheck = useCallback(() => setStep('info-check'), [])
  const goToPasswordCheck = useCallback(() => setStep('password-check'), [])

  const buildTransactionExtended = useCallback(
    async (data: TxData) => {
      setTransactionData(data)
      setIsLoading(true)

      try {
        if (type === 'transfer') {
          await buildTransferTransaction(data as TransferTxData, txContext)
        } else if (type === 'call-contract') {
          await buildCallContractTransaction(data as CallContractTxData, txContext)
        }

        setStep('info-check')
      } catch (e) {
        // When API error codes are available, replace this substring check with a proper error code check
        // https://github.com/alephium/alephium-frontend/issues/610
        const error = (e as unknown as string).toString()

        if (error.includes('consolidating') || error.includes('consolidate')) {
          setIsSweeping(true)
          setIsLoading(true)

          // TODO: See if you can simplify the data to only include AddressHash and not Address
          const { fromAddress } = data
          const { unsignedTxs, fees } = await buildSweepTransactions(
            fromAddress.publicKey,
            fromAddress.keyType,
            fromAddress.hash
          )

          setSweepUnsignedTxs(unsignedTxs)
          setIsLoading(false)

          dispatch(
            openModal({
              name: 'ConsolidateUTXOsModal',
              props: {
                fee: fees,
                onConsolidateClick: passwordRequirement
                  ? () => setStep('password-check')
                  : () => handleSendExtended(true)
              }
            })
          )
          setConsolidationRequired(true)
          sendAnalytics({ event: 'Could not build tx, consolidation required' })
        } else {
          const message = 'Error while building transaction'
          const errorMessage = getHumanReadableError(e, t(message))

          if (error.includes('NotEnoughApprovedBalance')) {
            dispatch(transactionBuildFailed('Your address does not have enough balance for this transaction'))
          } else {
            dispatch(transactionBuildFailed(errorMessage))
            sendAnalytics({ type: 'error', message })
          }

          if (isRequestToApproveContractCall && triggeredByWalletConnect) {
            sendFailureResponse({
              message: errorMessage,
              code: WALLETCONNECT_ERRORS.TRANSACTION_BUILD_FAILED
            })
            dispatch(closeModal({ id }))
          }
        }
      }

      setIsLoading(false)
    },
    [
      dispatch,
      handleSendExtended,
      id,
      isRequestToApproveContractCall,
      passwordRequirement,
      sendAnalytics,
      sendFailureResponse,
      t,
      triggeredByWalletConnect,
      txContext,
      type
    ]
  )

  useEffect(() => {
    if (isRequestToApproveContractCall && !isTransactionBuildTriggered && transactionData) {
      setIsTransactionBuildTriggered(true)
      buildTransactionExtended(transactionData)
    }
  }, [buildTransactionExtended, isRequestToApproveContractCall, isTransactionBuildTriggered, transactionData])

  const moveToSecondStep = useCallback((data: AddressesTxModalData) => {
    setAddressesData(data)
    setStep('build-tx')
  }, [])

  useEffect(() => {
    if (step === 'tx-sent') {
      setTimeout(() => dispatch(closeModal({ id })), 2000)
    }
  }, [dispatch, id, step])

  return (
    <CenteredModal
      id={id}
      title={title}
      onClose={onClose}
      isLoading={isLoading}
      focusMode
      disableBack={isRequestToApproveContractCall && step !== 'password-check'}
      hasFooterButtons
    >
      {step === 'addresses' &&
        (type === 'transfer' ? (
          <TransferAddressesTxModalContent data={addressesData} onSubmit={moveToSecondStep} onCancel={onClose} />
        ) : (
          <CallContractAddressesTxModalContent data={addressesData} onSubmit={moveToSecondStep} onCancel={onClose} />
        ))}
      {step === 'build-tx' &&
        (type === 'transfer' ? (
          <TransferBuildTxModalContent
            data={{ ...(transactionData ?? {}), ...addressesData }}
            onSubmit={buildTransactionExtended}
            onBack={goToAddresses}
          />
        ) : (
          <CallContractBuildTxModalContent
            data={{ ...(transactionData ?? {}), ...addressesData }}
            onSubmit={buildTransactionExtended}
            onCancel={onClose}
            onBack={goToAddresses}
          />
        ))}
      {step === 'info-check' &&
        !!transactionData &&
        !!fees &&
        (type === 'transfer' ? (
          <TransferCheckTxModalContent
            data={transactionData as TransferTxData}
            fees={fees}
            onSubmit={passwordRequirement ? goToPasswordCheck : () => handleSendExtended(consolidationRequired)}
            onBack={goToBuildTx}
            dAppUrl={dAppUrl}
          />
        ) : (
          <CallContractCheckTxModalContent
            data={transactionData as CallContractTxData}
            fees={fees}
            onSubmit={passwordRequirement ? goToPasswordCheck : () => handleSendExtended(consolidationRequired)}
            onBack={goToBuildTx}
            dAppUrl={dAppUrl}
          />
        ))}
      {step === 'password-check' && passwordRequirement && (
        <PasswordConfirmation
          text={t('Enter your password to send the transaction.')}
          buttonText={t('Send')}
          highlightButton
          onCorrectPasswordEntered={() => handleSendExtended(consolidationRequired)}
          onBack={goToInfoCheck}
        >
          <PasswordConfirmationNote>
            {t('You can disable this confirmation step from the wallet settings.')}
          </PasswordConfirmationNote>
        </PasswordConfirmation>
      )}
      {step === 'tx-sent' && (
        <ScrollableModalContent>
          <ConfirmationCheckContainer>
            <ConfirmationAnimation {...fadeIn}>
              <CheckIcon size={80} strokeWidth={1} />
            </ConfirmationAnimation>
          </ConfirmationCheckContainer>
        </ScrollableModalContent>
      )}
    </CenteredModal>
  )
}

export default SendModal

const PasswordConfirmationNote = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
`

const ConfirmationCheckContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
`

const ConfirmationAnimation = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  width: 150px;
  background-color: ${({ theme }) => colord(theme.global.valid).alpha(0.1).toHex()};
  border: 1px solid ${({ theme }) => colord(theme.global.valid).alpha(0.1).toHex()};
  border-radius: var(--radius-full);
`

const CheckIcon = styled(Check)`
  color: ${({ theme }) => theme.global.valid};
`
