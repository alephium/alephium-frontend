import { getHumanReadableError } from '@alephium/shared'
import { colord } from 'colord'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import {
  fetchSweepTransactionsFees,
  fetchTransferTransactionsFees,
  sendSweepTransactions,
  sendTransferTransaction
} from '@/api/transactions'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { closeModal, openModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import TransferAddressesTxModalContent from '@/features/send/sendModals/transfer/AddressesTxModalContent'
import TransferBuildTxModalContent from '@/features/send/sendModals/transfer/BuildTxModalContent'
import TransferCheckTxModalContent from '@/features/send/sendModals/transfer/CheckTxModalContent'
import { TransferAddressesTxModalOnSubmitData, TransferTxData, TransferTxModalData } from '@/features/send/sendTypes'
import { getSweepTxParams, getTransferTxParams } from '@/features/send/sendUtils'
import { Step } from '@/features/send/StepsProgress'
import { selectEffectivePasswordRequirement } from '@/features/settings/settingsSelectors'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ScrollableModalContent } from '@/modals/CenteredModal'
import { transactionBuildFailed, transactionSendFailed } from '@/storage/transactions/transactionsActions'

export type SendModalProps = TransferTxModalData

function SendModal({ id, ...initialTxData }: ModalBaseProp & SendModalProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const passwordRequirement = useAppSelector(selectEffectivePasswordRequirement)
  const { sendAnalytics } = useAnalytics()
  const { isLedger, onLedgerError } = useLedger()

  const [addressesData, setAddressesData] = useState<TransferTxModalData>(initialTxData)
  const [transactionData, setTransactionData] = useState<TransferTxData>()
  const [isLoading, setIsLoading] = useState<boolean | string>(false)
  const [step, setStep] = useState<Step>('addresses')
  const [isSweeping, setIsSweeping] = useState(false)
  const [fees, setFees] = useState<bigint>()

  const [isTransactionBuildTriggered, setIsTransactionBuildTriggered] = useState(false)

  const onClose = useCallback(() => dispatch(closeModal({ id })), [dispatch, id])

  const handleSend = useCallback(async () => {
    if (!transactionData) return

    setIsLoading(isLedger ? t('Please, check your Ledger.') : true)

    try {
      const ledgerTxParams = { signerIndex: transactionData.fromAddress.index, onLedgerError }

      if (isSweeping) {
        const txParams = getSweepTxParams(transactionData, { toAddress: transactionData.toAddress })
        await sendSweepTransactions(txParams, isLedger, ledgerTxParams)

        sendAnalytics({ event: 'Swept address assets', props: { from: 'maxAmount' } })
      } else {
        const txParams = getTransferTxParams(transactionData)
        await sendTransferTransaction(txParams, isLedger, ledgerTxParams)

        sendAnalytics({ event: 'Sent transaction', props: { origin: 'send-modal' } })
      }

      setStep('tx-sent')
    } catch (error) {
      dispatch(transactionSendFailed(getHumanReadableError(error, t('Error while sending the transaction'))))
      sendAnalytics({ type: 'error', message: 'Could not send tx' })
    } finally {
      setIsLoading(false)
    }
  }, [dispatch, isLedger, isSweeping, onLedgerError, sendAnalytics, t, transactionData])

  const goToAddresses = useCallback(() => setStep('addresses'), [])
  const goToBuildTx = useCallback(() => setStep('build-tx'), [])
  const goToInfoCheck = useCallback(() => setStep('info-check'), [])
  const goToPasswordCheck = useCallback(() => setStep('password-check'), [])

  const buildTransactionExtended = useCallback(
    async (data: TransferTxData) => {
      setTransactionData(data)
      setIsLoading(true)
      setIsSweeping(data.shouldSweep)

      try {
        if (data.shouldSweep) {
          const txParams = getSweepTxParams(data, { toAddress: data.toAddress })
          const fees = await fetchSweepTransactionsFees(txParams)
          setFees(fees)
        } else {
          const txParams = getTransferTxParams(data)
          const fees = await fetchTransferTransactionsFees(txParams)
          setFees(fees)
        }

        setStep('info-check')
      } catch (e) {
        // When API error codes are available, replace this substring check with a proper error code check
        // https://github.com/alephium/alephium-frontend/issues/610
        const error = (e as unknown as string).toString().toLowerCase()

        if (error.includes('consolidating') || error.includes('consolidate')) {
          const txParams = getSweepTxParams(data, { toAddress: data.fromAddress.hash })
          const fees = await fetchSweepTransactionsFees(txParams)

          dispatch(
            openModal({
              name: 'SignConsolidateTxModal',
              props: { fees, txParams, onSuccess: () => setStep('tx-sent') }
            })
          )
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
        }
      }

      setIsLoading(false)
    },
    [dispatch, sendAnalytics, t]
  )

  useEffect(() => {
    if (!isTransactionBuildTriggered && transactionData) {
      setIsTransactionBuildTriggered(true)
      buildTransactionExtended(transactionData)
    }
  }, [buildTransactionExtended, isTransactionBuildTriggered, transactionData])

  const moveToSecondStep = useCallback((data: TransferAddressesTxModalOnSubmitData) => {
    setAddressesData(data)
    setStep('build-tx')
  }, [])

  useEffect(() => {
    if (step === 'tx-sent') {
      setTimeout(() => dispatch(closeModal({ id })), 2000)
    }
  }, [dispatch, id, step])

  return (
    <CenteredModal id={id} title={t('Send')} onClose={onClose} isLoading={isLoading} focusMode hasFooterButtons>
      {step === 'addresses' && (
        <TransferAddressesTxModalContent data={addressesData} onSubmit={moveToSecondStep} onCancel={onClose} />
      )}
      {step === 'build-tx' && (
        <TransferBuildTxModalContent
          data={{ ...(transactionData ?? {}), ...addressesData }}
          onSubmit={buildTransactionExtended}
          onBack={goToAddresses}
        />
      )}
      {step === 'info-check' && !!transactionData && !!fees && (
        <TransferCheckTxModalContent
          data={transactionData as TransferTxData}
          fees={fees}
          onSubmit={passwordRequirement ? goToPasswordCheck : handleSend}
          onBack={goToBuildTx}
        />
      )}
      {step === 'password-check' && passwordRequirement && (
        <PasswordConfirmation
          text={t('Enter your password to send the transaction.')}
          buttonText={t('Send')}
          highlightButton
          onCorrectPasswordEntered={handleSend}
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
