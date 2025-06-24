import { getHumanReadableError, selectAddressByHash, SignTransferTxModalProps, throttledClient } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useLedger } from '@/features/ledger/useLedger'
import { LedgerAlephium } from '@/features/ledger/utils'
import { closeModal, openModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckLockTimeBox from '@/features/send/CheckFeeLockTimeBox'
import CheckModalContent from '@/features/send/CheckModalContent'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import { selectEffectivePasswordRequirement } from '@/features/settings/settingsSelectors'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { signer } from '@/signer'

const SignTransferTxModal = memo(
  ({
    id,
    dAppUrl,
    txParams,
    unsignedData,
    onError,
    onSuccess,
    onUserDismiss
  }: ModalBaseProp & SignTransferTxModalProps) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()
    const passwordRequirement = useAppSelector(selectEffectivePasswordRequirement)
    const { isLedger, onLedgerError } = useLedger()
    const signerAddress = useAppSelector((s) => selectAddressByHash(s, txParams.signerAddress))

    const [isLoading, setIsLoading] = useState<boolean | string>(false)

    const maxLockTime = useMemo(
      () =>
        txParams.destinations.reduce((max, { lockTime }) => {
          if (lockTime && lockTime > max) {
            return lockTime
          }
          return max
        }, 0),
      [txParams.destinations]
    )

    const signAndSend = useCallback(async () => {
      try {
        if (!signerAddress) {
          throw Error('Signer address not found')
        }

        if (isLedger) {
          setIsLoading(t('Please, confirm the transaction on your Ledger.'))

          const { unsignedTx } = await throttledClient.txBuilder.buildTransferTx(txParams, signerAddress.publicKey)
          const signature = await LedgerAlephium.create()
            .catch(onLedgerError)
            .then((app) => (app ? app.signUnsignedTx(signerAddress.index, unsignedTx) : null))

          if (!signature) {
            throw Error('Ledger error')
          }

          const data = await throttledClient.node.transactions.postTransactionsSubmit({ unsignedTx, signature })

          onSuccess({
            ...data,
            signature,
            unsignedTx,
            gasAmount: unsignedData.gasAmount,
            gasPrice: unsignedData.gasPrice
          })
        } else {
          setIsLoading(true)

          const result = await signer.signAndSubmitTransferTx(txParams)

          onSuccess(result)
        }
      } catch (error) {
        onError(getHumanReadableError(error, t('Error while sending the transaction')))
        // TODO: show toast
        // TODO: analytics
      } finally {
        setIsLoading(false)
        dispatch(closeModal({ id }))
      }
    }, [
      dispatch,
      id,
      isLedger,
      onError,
      onLedgerError,
      onSuccess,
      signerAddress,
      t,
      txParams,
      unsignedData.gasAmount,
      unsignedData.gasPrice
    ])

    const checkPassword = useCallback(() => {
      if (passwordRequirement) {
        dispatch(openModal({ name: 'PasswordConfirmationModal', props: { onCorrectPasswordEntered: signAndSend } }))
      } else {
        signAndSend()
      }
    }, [dispatch, signAndSend, passwordRequirement])

    const handleApprovePress = useCallback(
      (isLockTimeConfirmed = false) => {
        if (maxLockTime && !isLockTimeConfirmed) {
          dispatch(
            openModal({
              name: 'ConfirmLockTimeModal',
              props: { lockTime: new Date(maxLockTime), onSubmit: checkPassword }
            })
          )
        } else {
          checkPassword()
        }
      },
      [dispatch, maxLockTime, checkPassword]
    )

    const handleRejectPress = useCallback(() => {
      dispatch(closeModal({ id }))
      onUserDismiss?.()
    }, [dispatch, id, onUserDismiss])

    const fees = BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice)

    return (
      <CenteredModal
        id={id}
        title={t('Send')}
        onClose={handleRejectPress}
        isLoading={isLoading}
        focusMode
        disableBack
        hasFooterButtons
      >
        <CheckModalContent>
          {txParams.destinations.map(({ address, attoAlphAmount, tokens, lockTime }) => {
            const assetAmounts = [
              { id: ALPH.id, amount: BigInt(attoAlphAmount) },
              ...(tokens ? tokens.map((token) => ({ ...token, amount: BigInt(token.amount) })) : [])
            ]
            return (
              <>
                <CheckAmountsBox assetAmounts={assetAmounts} hasBg hasHorizontalPadding />
                <CheckAddressesBox
                  fromAddressStr={txParams.signerAddress}
                  toAddressHash={address}
                  dAppUrl={dAppUrl}
                  hasBg
                  hasHorizontalPadding
                />
                {lockTime && <CheckLockTimeBox lockTime={new Date(lockTime)} />}
                <CheckWorthBox assetAmounts={assetAmounts} fee={fees} hasBg hasBorder hasHorizontalPadding />
              </>
            )
          })}
        </CheckModalContent>

        <ModalFooterButtons>
          <ModalFooterButton role="secondary" onClick={handleRejectPress}>
            {t('Reject')}
          </ModalFooterButton>
          <ModalFooterButton onClick={handleApprovePress}>{t('Send')}</ModalFooterButton>
        </ModalFooterButtons>
      </CenteredModal>
    )
  }
)

export default SignTransferTxModal
