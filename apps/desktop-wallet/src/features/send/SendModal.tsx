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

import { getHumanReadableError, WALLETCONNECT_ERRORS } from '@alephium/shared'
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
import DeployContractAddressesTxModalContent from '@/features/send/sendModals/deployContract/AddressesTxModalContent'
import DeployContractBuildTxModalContent from '@/features/send/sendModals/deployContract/BuildTxModalContent'
import DeployContractCheckTxModalContent from '@/features/send/sendModals/deployContract/CheckTxModalContent'
import {
  buildDeployContractTransaction,
  getDeployContractWalletConnectResult,
  handleDeployContractSend
} from '@/features/send/sendModals/deployContract/DeployContractSendModal'
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
  DeployContractTxData,
  TransferTxData,
  TxContext,
  TxData,
  UnsignedTx
} from '@/features/send/sendTypes'
import StepsProgress, { Step } from '@/features/send/StepsProgress'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ScrollableModalContent } from '@/modals/CenteredModal'
import {
  transactionBuildFailed,
  transactionSendFailed,
  transactionsSendSucceeded
} from '@/storage/transactions/transactionsActions'
import { Address } from '@/types/addresses'

export type ConfigurableSendModalProps<PT extends { fromAddress: Address }> = {
  txData?: TxData
  initialTxData: PT
  initialStep?: Step
  triggeredByWalletConnect?: boolean
}

export interface SendModalProps<PT extends { fromAddress: Address }> extends ConfigurableSendModalProps<PT> {
  title: string
  type: 'transfer' | 'call-contract' | 'deploy-contract'
}

function SendModal<PT extends { fromAddress: Address }>({
  title,
  initialTxData,
  txData,
  initialStep,
  type,
  id,
  triggeredByWalletConnect
}: ModalBaseProp & SendModalProps<PT>) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const settings = useAppSelector((s) => s.settings)
  const posthog = usePostHog()
  const { sendAnalytics } = useAnalytics()
  const { sendUserRejectedResponse, sendSuccessResponse, sendFailureResponse } = useWalletConnectContext()
  const { isLedger, onLedgerError } = useLedger()

  const [addressesData, setAddressesData] = useState<AddressesTxModalData>(txData ?? initialTxData)
  const [transactionData, setTransactionData] = useState(txData)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<Step>('addresses')
  const [consolidationRequired, setConsolidationRequired] = useState(false)
  const [isSweeping, setIsSweeping] = useState(false)
  const [sweepUnsignedTxs, setSweepUnsignedTxs] = useState<node.SweepAddressTransaction[]>([])
  const [fees, setFees] = useState<bigint>()
  const [unsignedTxId, setUnsignedTxId] = useState('')
  const [contractAddress, setContractAddress] = useState('')
  const [unsignedTransaction, setUnsignedTransaction] = useState<UnsignedTx>()
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
      setContractAddress,
      isSweeping,
      consolidationRequired
    }),
    [consolidationRequired, isSweeping, sweepUnsignedTxs, unsignedTransaction, unsignedTxId]
  )

  const handleSendExtended = useCallback(async () => {
    if (!transactionData) return

    setIsLoading(true)

    try {
      const signature =
        type === 'transfer'
          ? await handleTransferSend(transactionData as TransferTxData, txContext, posthog, isLedger, onLedgerError)
          : type === 'call-contract'
            ? await handleCallContractSend(
                transactionData as CallContractTxData,
                txContext,
                posthog,
                isLedger,
                onLedgerError
              )
            : await handleDeployContractSend(
                transactionData as DeployContractTxData,
                txContext,
                posthog,
                isLedger,
                onLedgerError
              )

      if (signature && triggeredByWalletConnect) {
        const result =
          type === 'transfer'
            ? getTransferWalletConnectResult(txContext, signature)
            : type === 'call-contract'
              ? getCallContractWalletConnectResult(txContext, signature)
              : getDeployContractWalletConnectResult(txContext, signature, contractAddress)

        sendSuccessResponse(result)
      }

      dispatch(transactionsSendSucceeded({ nbOfTransactionsSent: isSweeping ? sweepUnsignedTxs.length : 1 }))
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
  }, [
    contractAddress,
    dispatch,
    id,
    isLedger,
    isSweeping,
    onLedgerError,
    posthog,
    sendAnalytics,
    sendFailureResponse,
    sendSuccessResponse,
    sweepUnsignedTxs.length,
    t,
    transactionData,
    triggeredByWalletConnect,
    txContext,
    type
  ])

  const buildTransactionExtended = useCallback(
    async (data: TxData) => {
      setTransactionData(data)
      setIsLoading(true)

      try {
        if (type === 'transfer') {
          await buildTransferTransaction(data as TransferTxData, txContext)
        } else if (type === 'call-contract') {
          await buildCallContractTransaction(data as CallContractTxData, txContext)
        } else {
          await buildDeployContractTransaction(data as DeployContractTxData, txContext)
        }

        setStep('info-check')
      } catch (e) {
        // When API error codes are available, replace this substring check with a proper error code check
        // https://github.com/alephium/alephium-frontend/issues/610
        const error = (e as unknown as string).toString()

        if (error.includes('consolidating') || error.includes('consolidate')) {
          setIsSweeping(true)
          setIsLoading(true)

          const { fromAddress } = data
          const { unsignedTxs, fees } = await buildSweepTransactions(fromAddress, fromAddress.hash)

          setSweepUnsignedTxs(unsignedTxs)
          setIsLoading(false)

          dispatch(
            openModal({
              name: 'ConsolidateUTXOsModal',
              props: {
                fee: fees,
                onConsolidateClick: settings.passwordRequirement ? confirmPassword : handleSendExtended
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
      type,
      txContext,
      dispatch,
      settings.passwordRequirement,
      handleSendExtended,
      sendAnalytics,
      t,
      isRequestToApproveContractCall,
      triggeredByWalletConnect,
      sendFailureResponse,
      id
    ]
  )

  useEffect(() => {
    if (isRequestToApproveContractCall && !isTransactionBuildTriggered && transactionData) {
      setIsTransactionBuildTriggered(true)
      buildTransactionExtended(transactionData)
    }
  }, [buildTransactionExtended, isRequestToApproveContractCall, isTransactionBuildTriggered, transactionData])

  const moveToSecondStep = (data: AddressesTxModalData) => {
    setAddressesData(data)
    setStep('build-tx')
  }

  useEffect(() => {
    if (step === 'tx-sent') {
      setTimeout(onClose, 2000)
    }
  }, [onClose, step])

  const confirmPassword = () => setStep('password-check')

  const onBackCallback = {
    addresses: undefined,
    'build-tx': () => setStep('addresses'),
    'info-check': () => setStep('build-tx'),
    'password-check': () => setStep('info-check'),
    'tx-sent': undefined
  }[step]

  return (
    <CenteredModal
      id={id}
      title={title}
      onClose={onClose}
      isLoading={isLoading}
      dynamicContent
      onBack={onBackCallback}
      focusMode
      noPadding
      disableBack={isRequestToApproveContractCall && step !== 'password-check'}
    >
      <StepsProgress currentStep={step} isContract={type === 'call-contract' || type === 'deploy-contract'} />
      {step === 'addresses' &&
        (type === 'transfer' ? (
          <TransferAddressesTxModalContent data={addressesData} onSubmit={moveToSecondStep} onCancel={onClose} />
        ) : type === 'call-contract' ? (
          <CallContractAddressesTxModalContent data={addressesData} onSubmit={moveToSecondStep} onCancel={onClose} />
        ) : (
          <DeployContractAddressesTxModalContent data={addressesData} onSubmit={moveToSecondStep} onCancel={onClose} />
        ))}
      {step === 'build-tx' && (
        <ScrollableModalContent>
          {type === 'transfer' ? (
            <TransferBuildTxModalContent
              data={{ ...(transactionData ?? {}), ...addressesData }}
              onSubmit={buildTransactionExtended}
            />
          ) : type === 'call-contract' ? (
            <CallContractBuildTxModalContent
              data={{ ...(transactionData ?? {}), ...addressesData }}
              onSubmit={buildTransactionExtended}
              onCancel={onClose}
            />
          ) : (
            <DeployContractBuildTxModalContent
              data={{ ...(transactionData ?? {}), ...addressesData }}
              onSubmit={buildTransactionExtended}
              onCancel={onClose}
            />
          )}
        </ScrollableModalContent>
      )}
      {step === 'info-check' && !!transactionData && !!fees && (
        <ScrollableModalContent>
          {type === 'transfer' ? (
            <TransferCheckTxModalContent
              data={transactionData as TransferTxData}
              fees={fees}
              onSubmit={settings.passwordRequirement ? confirmPassword : handleSendExtended}
            />
          ) : type === 'call-contract' ? (
            <CallContractCheckTxModalContent
              data={transactionData as CallContractTxData}
              fees={fees}
              onSubmit={settings.passwordRequirement ? confirmPassword : handleSendExtended}
            />
          ) : (
            <DeployContractCheckTxModalContent
              data={transactionData as DeployContractTxData}
              fees={fees}
              onSubmit={settings.passwordRequirement ? confirmPassword : handleSendExtended}
            />
          )}
        </ScrollableModalContent>
      )}
      {step === 'password-check' && settings.passwordRequirement && (
        <ScrollableModalContent>
          <PasswordConfirmation
            text={t('Enter your password to send the transaction.')}
            buttonText={t('Send')}
            highlightButton
            onCorrectPasswordEntered={handleSendExtended}
          >
            <PasswordConfirmationNote>
              {t('You can disable this confirmation step from the wallet settings.')}
            </PasswordConfirmationNote>
          </PasswordConfirmation>
        </ScrollableModalContent>
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
