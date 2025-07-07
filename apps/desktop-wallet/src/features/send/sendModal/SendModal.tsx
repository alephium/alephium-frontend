import {
  getChainedTxPropsFromSignChainedTxParams,
  getGasRefillChainedTxParams,
  getHumanReadableError,
  getSweepTxParams,
  getTransferTxParams,
  SendFlowData,
  SignChainedTxModalProps,
  throttledClient
} from '@alephium/shared'
import { useFetchGroupedAddressesWithEnoughAlphForGas } from '@alephium/shared-react'
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
  sendChainedTransactions,
  sendSweepTransactions,
  sendTransferTransaction
} from '@/api/transactions'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { closeModal, openModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import SendModalAddressesStep from '@/features/send/sendModal/SendModalAddressesStep'
import SendModalBuildTxStep from '@/features/send/sendModal/SendModalBuildTxStep'
import SendModalInfoCheckStep from '@/features/send/sendModal/SendModalInfoCheckStep'
import { TransferAddressesTxModalOnSubmitData, TransferTxModalData } from '@/features/send/sendModal/sendTypes'
import { selectEffectivePasswordRequirement } from '@/features/settings/settingsSelectors'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ScrollableModalContent } from '@/modals/CenteredModal'
import { signer } from '@/signer'
import { transactionBuildFailed, transactionSendFailed } from '@/storage/transactions/transactionsActions'

export type SendModalProps = TransferTxModalData

type Step = 'addresses' | 'build-tx' | 'info-check' | 'password-check' | 'tx-sent'

function SendModal({ id, ...initialTxData }: ModalBaseProp & SendModalProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const passwordRequirement = useAppSelector(selectEffectivePasswordRequirement)
  const { sendAnalytics } = useAnalytics()
  const { isLedger, onLedgerError } = useLedger()

  const [addressesData, setAddressesData] = useState<TransferTxModalData>(initialTxData)
  const [sendFlowData, setSendFlowData] = useState<SendFlowData>()
  const [isLoading, setIsLoading] = useState<boolean | string>(false)
  const [step, setStep] = useState<Step>('addresses')
  const [isSweeping, setIsSweeping] = useState(false)
  const [fees, setFees] = useState<bigint>()

  const [isTransactionBuildTriggered, setIsTransactionBuildTriggered] = useState(false)
  const [chainedTxProps, setChainedTxProps] = useState<SignChainedTxModalProps['props']>()

  const { data: groupedAddressesWithEnoughAlphForGas } = useFetchGroupedAddressesWithEnoughAlphForGas()
  const groupedAddressWithEnoughAlphForGas = groupedAddressesWithEnoughAlphForGas?.find(
    (hash) => hash !== addressesData.fromAddress.hash
  )
  const shouldChainTxsForGasRefill = chainedTxProps && chainedTxProps.length > 0 && groupedAddressWithEnoughAlphForGas

  const onClose = useCallback(() => dispatch(closeModal({ id })), [dispatch, id])

  const handleSend = useCallback(async () => {
    if (!sendFlowData) return

    setIsLoading(isLedger ? t('Please, check your Ledger.') : true)

    try {
      const ledgerTxParams = { signerIndex: sendFlowData.fromAddress.index, onLedgerError }

      if (isSweeping) {
        const txParams = getSweepTxParams(sendFlowData)
        await sendSweepTransactions(txParams, isLedger, ledgerTxParams)

        sendAnalytics({ event: 'Swept address assets', props: { from: 'maxAmount' } })
      } else if (shouldChainTxsForGasRefill) {
        const txParams = getGasRefillChainedTxParams(groupedAddressWithEnoughAlphForGas, sendFlowData)
        await sendChainedTransactions(txParams, isLedger)
      } else {
        const txParams = getTransferTxParams(sendFlowData)
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
  }, [
    dispatch,
    groupedAddressWithEnoughAlphForGas,
    isLedger,
    isSweeping,
    onLedgerError,
    sendAnalytics,
    shouldChainTxsForGasRefill,
    t,
    sendFlowData
  ])

  const goToAddresses = useCallback(() => setStep('addresses'), [])
  const goToBuildTx = useCallback(() => setStep('build-tx'), [])
  const goToInfoCheck = useCallback(() => setStep('info-check'), [])
  const goToPasswordCheck = useCallback(() => setStep('password-check'), [])

  const handleTransactionBuildError = useCallback(
    (e: unknown) => {
      const error = (e as unknown as string).toString().toLowerCase()
      const message = 'Error while building transaction'
      const errorMessage = getHumanReadableError(e, t(message))

      if (error.includes('NotEnoughApprovedBalance')) {
        dispatch(transactionBuildFailed('Your address does not have enough balance for this transaction'))
      } else {
        dispatch(transactionBuildFailed(errorMessage))
        sendAnalytics({ type: 'error', message })
      }
    },
    [dispatch, sendAnalytics, t]
  )

  const buildTransactionExtended = useCallback(
    async (data: SendFlowData, shouldSweep: boolean) => {
      setSendFlowData(data)
      setIsLoading(true)
      setIsSweeping(shouldSweep)

      try {
        if (shouldSweep) {
          const txParams = getSweepTxParams(data)
          const fees = await fetchSweepTransactionsFees(txParams)
          setFees(fees)
        } else {
          const txParams = getTransferTxParams(data)
          const fees = await fetchTransferTransactionsFees(txParams)
          setFees(fees)
        }

        setStep('info-check')
        setChainedTxProps(undefined)
      } catch (e) {
        // When API error codes are available, replace this substring check with a proper error code check
        // https://github.com/alephium/alephium-frontend/issues/610
        const error = (e as unknown as string).toString().toLowerCase()

        try {
          if (error.includes('consolidating') || error.includes('consolidate')) {
            const txParams = getSweepTxParams({ ...data, toAddress: data.fromAddress.hash })
            const fees = await fetchSweepTransactionsFees(txParams)

            dispatch(
              openModal({
                name: 'SignConsolidateTxModal',
                props: { fees, txParams, onSuccess: () => setStep('tx-sent') }
              })
            )
            sendAnalytics({ event: 'Could not build tx, consolidation required' })
            setChainedTxProps(undefined)
          } else if (error.includes('not enough') && !isLedger && groupedAddressWithEnoughAlphForGas) {
            const txParams = getGasRefillChainedTxParams(groupedAddressWithEnoughAlphForGas, data)

            const unsignedData = await throttledClient.txBuilder.buildChainedTx(txParams, [
              await signer.getPublicKey(groupedAddressWithEnoughAlphForGas),
              await signer.getPublicKey(data.fromAddress.hash)
            ])

            const props = getChainedTxPropsFromSignChainedTxParams(txParams, unsignedData)
            setChainedTxProps(props)
            setIsSweeping(false)

            setStep('info-check')
          } else throw e
        } catch (e) {
          handleTransactionBuildError(e)
          setChainedTxProps(undefined)
        }
      }

      setIsLoading(false)
    },
    [dispatch, groupedAddressWithEnoughAlphForGas, handleTransactionBuildError, isLedger, sendAnalytics]
  )

  useEffect(() => {
    if (!isTransactionBuildTriggered && sendFlowData) {
      setIsTransactionBuildTriggered(true)
      buildTransactionExtended(sendFlowData, isSweeping)
    }
  }, [buildTransactionExtended, isSweeping, isTransactionBuildTriggered, sendFlowData])

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
        <SendModalAddressesStep data={addressesData} onSubmit={moveToSecondStep} onCancel={onClose} />
      )}
      {step === 'build-tx' && (
        <SendModalBuildTxStep
          data={{ ...(sendFlowData ?? {}), ...addressesData }}
          onSubmit={buildTransactionExtended}
          onBack={goToAddresses}
        />
      )}
      {step === 'info-check' && !!sendFlowData && !!fees && (
        <SendModalInfoCheckStep
          data={sendFlowData}
          chainedTxProps={chainedTxProps}
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
