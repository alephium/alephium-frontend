import {
  getHumanReadableError,
  selectAddressByHash,
  SignDeployContractTxModalProps,
  throttledClient,
  transactionSent
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { SignDeployContractTxResult } from '@alephium/web3'
import { usePostHog } from 'posthog-js/react'
import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useLedger } from '@/features/ledger/useLedger'
import { LedgerAlephium } from '@/features/ledger/utils'
import { closeModal, openModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import BytecodeExpandableSection from '@/features/send/BytecodeExpandableSection'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckModalContent from '@/features/send/CheckModalContent'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import InfoRow from '@/features/send/InfoRow'
import { selectEffectivePasswordRequirement } from '@/features/settings/settingsSelectors'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { signer } from '@/signer'

const SignDeployContractTxModal = memo(
  ({
    id,
    dAppUrl,
    txParams,
    unsignedData,
    onUserDismiss,
    onError,
    onSuccess
  }: SignDeployContractTxModalProps & ModalBaseProp) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()
    const passwordRequirement = useAppSelector(selectEffectivePasswordRequirement)
    const { isLedger, onLedgerError } = useLedger()
    const signerAddress = useAppSelector((s) => selectAddressByHash(s, txParams.signerAddress))
    const [isLoading, setIsLoading] = useState(false)
    const posthog = usePostHog()

    const handleRejectPress = useCallback(() => {
      dispatch(closeModal({ id }))
      onUserDismiss?.()
    }, [dispatch, id, onUserDismiss])

    const signAndSend = useCallback(async () => {
      try {
        if (!signerAddress) {
          throw Error('Signer address not found')
        }

        let result: SignDeployContractTxResult

        if (isLedger) {
          setIsLoading(t('Please, confirm the transaction on your Ledger.'))

          const buildResult = await throttledClient.txBuilder.buildDeployContractTx(txParams, signerAddress.publicKey)

          const signature = await LedgerAlephium.create()
            .catch(onLedgerError)
            .then((app) => (app ? app.signUnsignedTx(signerAddress.index, buildResult.unsignedTx) : null))

          if (!signature) {
            throw Error('Ledger error')
          }

          await throttledClient.node.transactions.postTransactionsSubmit({
            unsignedTx: buildResult.unsignedTx,
            signature
          })

          result = { signature, ...buildResult }
        } else {
          setIsLoading(true)

          result = await signer.signAndSubmitDeployContractTx(txParams)
        }

        onSuccess(result)

        dispatch(
          transactionSent({
            hash: result.txId,
            fromAddress: txParams.signerAddress,
            toAddress: '',
            timestamp: new Date().getTime(),
            type: 'contract',
            status: 'sent'
          })
        )

        posthog.capture('Deployed smart contract')
      } catch (error) {
        onError(getHumanReadableError(error, t('Error while sending the transaction')))
        // TODO: show toast
        // TODO: analytics
      } finally {
        setIsLoading(false)
        dispatch(closeModal({ id }))
      }
    }, [signerAddress, isLedger, onSuccess, dispatch, txParams, posthog, t, onLedgerError, onError, id])

    const handleApprovePress = useCallback(() => {
      if (passwordRequirement) {
        dispatch(
          openModal({
            name: 'PasswordConfirmationModal',
            props: { onCorrectPasswordEntered: signAndSend }
          })
        )
      } else {
        signAndSend()
      }
    }, [dispatch, passwordRequirement, signAndSend])

    const initialAlphAmount = txParams.initialAttoAlphAmount
      ? [{ id: ALPH.id, amount: BigInt(txParams.initialAttoAlphAmount) }]
      : undefined
    const issueTokenAmount = txParams.issueTokenAmount?.toString()
    const fees = useMemo(() => BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice), [unsignedData])

    return (
      <CenteredModal
        id={id}
        title={t('Deploy contract')}
        onClose={handleRejectPress}
        isLoading={isLoading}
        focusMode
        disableBack
        hasFooterButtons
      >
        <CheckModalContent>
          {initialAlphAmount && <CheckAmountsBox assetAmounts={initialAlphAmount} hasBg hasHorizontalPadding />}
          {issueTokenAmount && <InfoRow label={t('Issue token amount')}>{issueTokenAmount}</InfoRow>}
          <CheckAddressesBox fromAddressStr={txParams.signerAddress} dAppUrl={dAppUrl} hasBg hasHorizontalPadding />
          {initialAlphAmount && (
            <CheckWorthBox assetAmounts={initialAlphAmount} fee={fees} hasBg hasBorder hasHorizontalPadding />
          )}
          <BytecodeExpandableSection bytecode={txParams.bytecode} />
        </CheckModalContent>
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
)

export default SignDeployContractTxModal
